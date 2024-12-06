import React, { useState, useEffect } from "react";
import * as tmImage from "@teachablemachine/image";
import { auth, db } from "./firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import "./Quiz.css"; // CSSファイルのインポート
import { IoMdCloudUpload } from "react-icons/io";
import { Helmet } from "react-helmet";


const Quiz = () => {
  const [model, setModel] = useState(null);
  const [image, setImage] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [quizOptions, setQuizOptions] = useState([]);
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [correctAnswerInfo, setCorrectAnswerInfo] = useState("");
  const navigate = useNavigate();
  const modelURL = "https://teachablemachine.withgoogle.com/models/Y5i61Nfmy/";

  useEffect(() => {
    const loadModel = async () => {
      try {
        const modelLoaded = await tmImage.load(
          `${modelURL}model.json`,
          `${modelURL}metadata.json`
        );
        setModel(modelLoaded);
      } catch (error) {
        console.error("モデルのロードに失敗しました:", error);
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUser({ ...currentUser, points: userDoc.data().points || 0 });
          setPoints(userDoc.data().points || 0);
        }
      }
    };
    fetchUser();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setImage(imageURL);
    }
  };

  const handlePredict = async () => {
    if (model && image) {
      setIsLoading(true);
      const imgElement = document.createElement("img");
      imgElement.src = image;

      imgElement.onload = async () => {
        const allPredictions = [];
        // 5回予測を行い結果を保存
        for (let i = 0; i < 5; i++) {
          const predictions = await model.predict(imgElement);
          allPredictions.push(predictions);
        }

        // 平均確率を計算
        const averagedPredictions = {};
        allPredictions.flat().forEach((p) => {
          if (!averagedPredictions[p.className]) {
            averagedPredictions[p.className] = { total: 0, count: 0 };
          }
          averagedPredictions[p.className].total += p.probability;
          averagedPredictions[p.className].count += 1;
        });

        const averagedResults = Object.keys(averagedPredictions).map((key) => ({
          className: key,
          probability:
            averagedPredictions[key].total / averagedPredictions[key].count,
        }));

        averagedResults.sort((a, b) => b.probability - a.probability);
        setPredictions(averagedResults);
        createQuiz(averagedResults, averagedResults[0].className);
        setIsLoading(false);
      };
    }
  };

  const createQuiz = (predictions, correctAnswer) => {
    const otherOptions = predictions
      .filter((p) => p.className !== correctAnswer)
      .slice(0, 3)
      .map((p) => p.className);
    const options = [correctAnswer, ...otherOptions].sort(() => Math.random() - 0.5);
    setQuizOptions(options);
  };

  const handleAnswerClick = async (answer) => {
    const correctAnswer = predictions[0]?.className;
    if (answer === correctAnswer) {
      alert("正解！10ポイント加算！");
      setCorrectAnswerInfo(getCloudDescription(correctAnswer));
      await updateUserPoints(10);
    } else {
      alert(`不正解…正解は: ${correctAnswer}`);
      setCorrectAnswerInfo(getCloudDescription(correctAnswer));
    }
  };

  const getCloudDescription = (cloudType) => {
    const descriptions = {
      "巻雲": `
        <h3>解析結果：巻雲 (Cirrus)</h3>
        <p><strong>別称:</strong> すじ雲</p>
        <p>巻雲は、氷の結晶で構成され、空に細長く広がる白い筋状の雲です。非常に高い場所（約6,000〜13,000m）に現れ、天気が安定しているときによく見られます。</p>
        <p><strong>雑学:</strong> 巻雲が広がると天気が下り坂になることが多いと言われています。</p>
      `,
      "巻積雲": `
        <h3>解析結果：巻積雲 (Cirrocumulus)</h3>
        <p><strong>別称:</strong> うろこ雲、いわし雲</p>
        <p>小さな白い塊が群れをなすように広がる雲で、魚のうろこのように見えることから「うろこ雲」とも呼ばれます。</p>
      `,
      // 他の雲の説明もここに続けてください
      "高層雲": `
        <h3>解析結果：高層雲 (Altostratus)</h3>
        <p>空一面を覆う薄い灰色の雲で、太陽や月の輪郭がぼんやりと見えることがあります。</p>
      `,
      "乱層雲": `
        <h3>解析結果：乱層雲 (Nimbostratus)</h3>
        <p>厚い灰色の雲で、広範囲にわたって降雨や降雪をもたらします。</p>
      `,
      "層積雲": `
        <h3>解析結果：層積雲 (Stratocumulus)</h3>
        <p>大きな塊状の雲で、空の一部または全体を覆うことがあります。</p>
      `,
      "積雲": `
        <h3>解析結果：積雲 (Cumulus)</h3>
        <p>白くてふわふわした綿のような見た目の雲で、天気の良い日に見られることが多いです。</p>
      `,
      "積乱雲": `
        <h3>解析結果：積乱雲 (Cumulonimbus)</h3>
        <p>巨大で縦に発達する雲で、雷雨や突風を伴うことがあります。</p>
      `,
    };
    return descriptions[cloudType] || "情報が見つかりません。";
  };
  

  const updateUserPoints = async (increment) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const updatedPoints = points + increment;
      await updateDoc(userRef, { points: updatedPoints });
      setPoints(updatedPoints);
    }
  };

  const handleExit = () => navigate("/");

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
    <Helmet>
    <title>CloudQuest - この雲は何かな？</title>
    </Helmet>
    <div className="quiz-container">

      {/* Header */}
      <header className="header">
        <div className="header-content">
        <Link to="/" className="site-name">
          <img src="/src/assets/icon-correct-24-1.png" alt="icon" className="site-icon" />
          <h2>CloudQuest</h2>
        </Link>
          <h2>CloudQuest</h2>
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

      {/* 画像アップロードとクイズ表示 */}
      <div className="upload-container">
        <label className="file-label">
          <span className="cloud-icon"><IoMdCloudUpload /></span>
          {isLoading ? <p className="loading-text">AIによるクイズ作成中...</p> : <p className="upload-text">replace image</p>}
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </label>
        {image && <img src={image} alt="Uploaded" />}
      </div>
      <button onClick={handlePredict} disabled={isLoading}>
        {isLoading ? "予測中..." : "クイズを開始"}
      </button>
      {quizOptions.length > 0 && (
        <div>
          <h2>Q. この雲はどれ？</h2>
          {quizOptions.map((option, index) => (
            <button key={index} onClick={() => handleAnswerClick(option)}>
              {option}
            </button>
          ))}
        </div>
      )}
      {correctAnswerInfo && (
        <div dangerouslySetInnerHTML={{ __html: correctAnswerInfo }} />
      )}
      <button onClick={handleExit}>HOMEに戻る</button>
    </div>
  </>
  );
};

export default Quiz;
