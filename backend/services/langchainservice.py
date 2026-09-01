import asyncio
import logging
import os
from typing import List, Dict, Any, Optional, Set
import networkx as nx
from sqlalchemy.orm import Session
from models.problemmodel import Problem
from utils.settings import settings

logger = logging.getLogger("uvicorn")

class CPKnowledgeGraph:
    """
    In-memory Knowledge Graph for Competitive Programming topics and problems.
    Node types:
      - 'topic': CP topics/tags (e.g., 'dp', 'graphs', 'dijkstra')
      - 'problem': Problem records connected to topic nodes via HAS_PROBLEM edges
    Edge types:
      - 'PREREQUISITE_FOR': Directed prerequisite relationship between topics
      - 'HAS_PROBLEM': Relationship between a topic and a problem
    """
    def __init__(self):
        self.graph = nx.DiGraph()
        self._build_topic_ontology()

    def _build_topic_ontology(self):
        """Build directed topic prerequisite edges."""
        prerequisites = [
            ("math", "number-theory"),
            ("number-theory", "combinatorics"),
            ("number-theory", "modular-arithmetic"),
            ("bitwise", "bitmask-dp"),
            ("arrays", "two-pointers"),
            ("two-pointers", "sliding-window"),
            ("arrays", "binary-search"),
            ("data-structures", "stacks"),
            ("data-structures", "queues"),
            ("data-structures", "heaps"),
            ("data-structures", "segment-tree"),
            ("segment-tree", "fenwick-tree"),
            ("dp", "bitmask-dp"),
            ("dp", "tree-dp"),
            ("dp", "digit-dp"),
            ("dp", "knapsack"),
            ("graphs", "dfs"),
            ("graphs", "bfs"),
            ("dfs", "dijkstra"),
            ("dfs", "topological-sort"),
            ("dfs", "tree-algorithms"),
            ("dijkstra", "shortest-path"),
            ("graphs", "disjoint-set-union"),
            ("strings", "string-hashing"),
            ("strings", "trie"),
            ("strings", "kmp"),
            ("greedy", "two-pointers"),
            ("constructive-algorithms", "greedy"),
        ]
        for parent, child in prerequisites:
            self.graph.add_edge(parent, child, relation="PREREQUISITE_FOR")
            self.graph.nodes[parent]["type"] = "topic"
            self.graph.nodes[child]["type"] = "topic"

    def populate_problems(self, problems: List[Problem]):
        """Populate problem nodes into the knowledge graph and link them to topic nodes."""
        for p in problems:
            prob_node_id = f"problem_{p.id}"
            
            topics_list = []
            if p.topics and isinstance(p.topics, list):
                topics_list = p.topics
            elif p.topics and isinstance(p.topics, str):
                topics_list = [t.strip() for t in p.topics.split(",")]

            self.graph.add_node(
                prob_node_id,
                type="problem",
                id=p.id,
                title=p.title,
                url=p.url,
                platform=p.platform,
                rating=p.rating,
                difficulty=p.difficulty,
                topics=topics_list,
                embedding_score=p.embedding_score
            )

            for t in topics_list:
                clean_topic = str(t).strip().lower().replace(" ", "-")
                if not self.graph.has_node(clean_topic):
                    self.graph.add_node(clean_topic, type="topic")
                
                self.graph.add_edge(clean_topic, prob_node_id, relation="HAS_PROBLEM")

    def find_related_topics(self, weak_topics: List[str]) -> Set[str]:
        """Expand weak topics via 1-hop and 2-hop graph traversal (parents, children, neighbors)."""
        expanded_topics = set()

        for raw_topic in weak_topics:
            norm_topic = str(raw_topic).strip().lower().replace(" ", "-")
            
            matched_nodes = [
                n for n, d in self.graph.nodes(data=True)
                if d.get("type") == "topic" and (n == norm_topic or norm_topic in n or n in norm_topic)
            ]

            if not matched_nodes:
                expanded_topics.add(norm_topic)
                continue

            for t_node in matched_nodes:
                expanded_topics.add(t_node)
                if self.graph.has_node(t_node):
                    successors = set(self.graph.successors(t_node))
                    predecessors = set(self.graph.predecessors(t_node))
                    expanded_topics.update(successors)
                    expanded_topics.update(predecessors)

        return expanded_topics

    def recommend_problems(self, weakness_dict: Dict[str, Any], k: int = 10) -> List[Dict[str, Any]]:
        """Traverse the knowledge graph to score and rank problem nodes matching target rating & weak topics."""
        raw_rating = weakness_dict.get("rating")
        difficulty = weakness_dict.get("difficulty", "Medium")
        weak_topics = weakness_dict.get("topics", [])
        if isinstance(weak_topics, str):
            weak_topics = [weak_topics]
        elif not isinstance(weak_topics, list):
            weak_topics = []

        if isinstance(raw_rating, (int, float)):
            target_rating = float(raw_rating)
        else:
            target_rating = {"Easy": 800.0, "Medium": 1400.0, "Hard": 2000.0}.get(str(difficulty), 1200.0)

        min_rating = max(800.0, target_rating - 300.0)
        max_rating = target_rating + 300.0

        expanded_topics = self.find_related_topics(weak_topics)
        logger.info(f"[KG Engine] Expanded weak topics {weak_topics} -> {expanded_topics}")

        candidate_problems: Dict[int, Dict[str, Any]] = {}

        for topic in expanded_topics:
            if not self.graph.has_node(topic):
                continue
            
            neighbors = self.graph.neighbors(topic)
            for nbr in neighbors:
                node_attrs = self.graph.nodes[nbr]
                if node_attrs.get("type") == "problem":
                    pid = node_attrs["id"]
                    prating = node_attrs.get("rating")
                    
                    if prating is not None and min_rating <= float(prating) <= max_rating:
                        if pid not in candidate_problems:
                            distance = abs(float(prating) - target_rating)
                            candidate_problems[pid] = {
                                "id": node_attrs["id"],
                                "title": node_attrs["title"],
                                "url": node_attrs["url"],
                                "platform": node_attrs["platform"],
                                "rating": node_attrs["rating"],
                                "difficulty": node_attrs["difficulty"],
                                "topics": node_attrs["topics"],
                                "embedding_score": node_attrs["embedding_score"],
                                "similarity_distance": round(distance, 2)
                            }

        ranked_problems = sorted(candidate_problems.values(), key=lambda p: p["similarity_distance"])
        return ranked_problems[:k]


cp_knowledge_graph: Optional[CPKnowledgeGraph] = None


def build_problems_knowledge_graph(db: Session, max_problems: int = 500) -> Optional[CPKnowledgeGraph]:
    global cp_knowledge_graph

    problems: List[Problem] = (
        db.query(Problem)
        .filter(Problem.rating.isnot(None))
        .order_by(Problem.id.desc())
        .limit(max_problems)
        .all()
    )
    if not problems:
        logger.info("[KG Engine] No rated problems found in database to populate Knowledge Graph.")
        return None

    try:
        kg = CPKnowledgeGraph()
        kg.populate_problems(problems)
        cp_knowledge_graph = kg
        logger.info(f"[KG Engine] Successfully populated Knowledge Graph with {len(problems)} problems.")
        return cp_knowledge_graph
    except Exception as e:
        logger.error(f"[KG Engine] Failed to build Knowledge Graph: {e}")
        cp_knowledge_graph = None
        return None


def get_knowledge_graph() -> Optional[CPKnowledgeGraph]:
    return cp_knowledge_graph


async def embed_weakness(weakness_dict: Dict[str, Any]) -> List[float]:
    """Legacy compatibility stub for embedding vector structure."""
    return []


def _sync_query_similar_problems(weakness_dict: Dict[str, Any], k: int = 10, db: Optional[Session] = None) -> List[Dict[str, Any]]:
    global cp_knowledge_graph

    if cp_knowledge_graph:
        kg_results = cp_knowledge_graph.recommend_problems(weakness_dict, k=k)
        if kg_results:
            return kg_results

    if db:
        raw_rating = weakness_dict.get("rating")
        difficulty = weakness_dict.get("difficulty", "Medium")
        topics = weakness_dict.get("topics", [])
        if isinstance(topics, str):
            topics = [topics]
        elif not isinstance(topics, list):
            topics = []

        if isinstance(raw_rating, (int, float)):
            target_rating = float(raw_rating)
        else:
            target_rating = {"Easy": 800.0, "Medium": 1400.0, "Hard": 2000.0}.get(str(difficulty), 1200.0)

        min_rating = max(800.0, target_rating - 500.0)
        max_rating = target_rating + 500.0

        from sqlalchemy import or_, func, cast, String

        topic_conditions = []
        for t in topics:
            clean_topic = str(t).strip()
            if clean_topic:
                topic_conditions.append(cast(Problem.topics, String).ilike(f"%{clean_topic}%"))

        if topic_conditions:
            topic_matched_problems = (
                db.query(Problem)
                .filter(
                    Problem.rating.isnot(None),
                    Problem.rating.between(min_rating, max_rating),
                    or_(*topic_conditions)
                )
                .order_by(func.abs(Problem.rating - target_rating))
                .limit(k)
                .all()
            )

            if not topic_matched_problems:
                topic_matched_problems = (
                    db.query(Problem)
                    .filter(or_(*topic_conditions))
                    .order_by(func.abs(func.coalesce(Problem.rating, target_rating) - target_rating))
                    .limit(k)
                    .all()
                )

            if topic_matched_problems:
                return [
                    {
                        "id": p.id,
                        "title": p.title,
                        "url": p.url,
                        "platform": p.platform,
                        "rating": p.rating,
                        "difficulty": p.difficulty,
                        "topics": p.topics,
                        "embedding_score": p.embedding_score,
                        "similarity_distance": round(abs((p.rating or target_rating) - target_rating), 2)
                    }
                    for p in topic_matched_problems
                ]

        rated_problems = (
            db.query(Problem)
            .filter(Problem.rating.isnot(None))
            .order_by(func.abs(Problem.rating - target_rating))
            .limit(k)
            .all()
        )

        if rated_problems:
            return [
                {
                    "id": p.id,
                    "title": p.title,
                    "url": p.url,
                    "platform": p.platform,
                    "rating": p.rating,
                    "difficulty": p.difficulty,
                    "topics": p.topics,
                    "embedding_score": p.embedding_score,
                    "similarity_distance": round(abs((p.rating or target_rating) - target_rating), 2)
                }
                for p in rated_problems
            ]

        any_problems = db.query(Problem).limit(k).all()
        return [
            {
                "id": p.id,
                "title": p.title,
                "url": p.url,
                "platform": p.platform,
                "rating": p.rating or 1200,
                "difficulty": p.difficulty or "Medium",
                "topics": p.topics or ["Algorithms"],
                "embedding_score": p.embedding_score,
                "similarity_distance": 0.0
            }
            for p in any_problems
        ]

    return []


async def query_similar_problems_by_vector(weakness_dict: Dict[str, Any], k: int = 10, db: Optional[Session] = None) -> List[Dict[str, Any]]:
    """Kept function name signature for route compatibility."""
    return await asyncio.to_thread(_sync_query_similar_problems, weakness_dict, k, db)

