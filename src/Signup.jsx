import React, { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        username: "unknown", // 初期ユーザーネームは "unknown"
        points: 0,           // 初期ポイントは0
      });
      navigate("/"); // 新規登録成功時にホーム画面へリダイレクト
    } catch (error) {
      setError("新規登録に失敗しました。もう一度お試しください。");
    }
  };

  return (
    <div className="auth-container">
      <h2>新規登録</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSignup} className="auth-form">
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-input"
        />
        <button type="submit" className="auth-button">登録</button>
      </form>
      <p className="auth-link">
        すでにアカウントをお持ちですか？ <Link to="/login">こちら</Link> からログインしてください。
      </p>
    </div>
  );
};

export default Signup;
