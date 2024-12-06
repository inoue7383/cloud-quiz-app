import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import "./Home.css";
import { Helmet } from "react-helmet";

const Home = () => {
  const [user, setUser] = useState(null); // Logged-in user info
  const [ranking, setRanking] = useState([]); // Leaderboard data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            ...currentUser,
            points: userData.points || 0,
            username: userData.username || "unknown",
          });
        }
      } else {
        setUser(null);
      }
    });

    const fetchRanking = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      users.sort((a, b) => b.points - a.points); // Sort by points
      setRanking(users);
      setLoading(false);
    };

    fetchRanking();
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };
  // スタイルを動的に設定
  const rankingTitleStyle = {
    position: "relative",
    top: user ? "0px" : "65px", // ログイン状態によってtopを調整
  };
  return (
    <>
    <Helmet>
    <title>CloudQuest - ホーム</title>
    </Helmet>
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
        <Link to="/" className="site-name">
          <img src="/assets/icon-correct-24-1.png" alt="icon" className="site-icon" />
          <h2>CloudQuest</h2>
        </Link>
          {user ? (
            <button className="logout-button" onClick={handleLogout}>
              ログアウト
            </button>
          ) : (
            <Link to="/login" className="login-link">
              ログイン
            </Link>
          )}
        </div>
      </header>
          
      {/* User Info */}
      {user && (
        <div className="user-info">
        <Link to="/accountSettings">アカウント設定はこちらから →<br/></Link>
        <span>{user.username || "unknown"} {user.points}P</span>
        </div>

      )}
      {/* Hero Section */}
      <div className="hero-section" style={rankingTitleStyle}>
        <div className="hero-text">
          <h1>クイズで学び、</h1>
          <h1>ランキングで競おう！</h1>
          <h3>AIと作る自分だけの教材</h3>
          {user ? (
            <Link to="/quiz" className="quiz-button">
              クイズに挑戦
            </Link>
          ) : (
            <Link to="/Login" className="quiz-button">
              まずはログインしよう
            </Link>
          )}
        </div>
      </div>
      {/* Ranking Section */}
      <h2 className="ranking-title" style={rankingTitleStyle}>総合ランキング</h2>
      <div className="ranking-container" style={rankingTitleStyle}>
        {loading ? (
          <p>読み込み中...</p>
        ) : (
          <ul className="ranking-list">
            {ranking.map((userRank, index) => (
              <li
                key={userRank.id}
                className={`ranking-item ${
                  index === 0
                    ? "top-ranking-1"
                    : index === 1
                    ? "top-ranking-2"
                    : index === 2
                    ? "top-ranking-3"
                    : ""
                }`}
              >
                <span>{index + 1}</span>
                <span>{userRank.username || "unknown"}</span>
                <span>{userRank.points}P</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quiz Button */}
    {user ? (
        <Link to="/quiz" className="quiz-button">
        クイズに挑戦
      </Link>
    ) : (
        <Link to="/Login" className="quiz-button"  style={rankingTitleStyle}>
          まずはログインしよう
        </Link>
    )}
    </div>
    </>
  );
};

export default Home;
