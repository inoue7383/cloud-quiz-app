import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { updateEmail, updatePassword } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi"; // 戻るアイコン

const AccountSettings = () => {
  const [user, setUser] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setNewUsername(userDoc.data().username);
          setNewEmail(currentUser.email);
        }
      }
    };
    fetchUser();
  }, []);

  const handleUsernameChange = async () => {
    try {
      setIsSubmitting(true);
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { username: newUsername });
      }
      setIsSubmitting(false);
      alert("ユーザー名が更新されました！");
    } catch (error) {
      setIsSubmitting(false);
      setError("ユーザー名の更新に失敗しました。");
    }
  };

  const handleEmailChange = async () => {
    try {
      setIsSubmitting(true);
      if (user && newEmail !== user.email) {
        await updateEmail(user, newEmail);
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { email: newEmail });
      }
      setIsSubmitting(false);
      alert("メールアドレスが更新されました！");
    } catch (error) {
      setIsSubmitting(false);
      setError("メールアドレスの更新に失敗しました。");
    }
  };

  const handlePasswordChange = async () => {
    try {
      setIsSubmitting(true);
      if (user && newPassword && currentPassword) {
        const credential = auth.EmailAuthProvider.credential(user.email, currentPassword);
        await user.reauthenticateWithCredential(credential);
        await updatePassword(user, newPassword);
      }
      setIsSubmitting(false);
      alert("パスワードが更新されました！");
    } catch (error) {
      setIsSubmitting(false);
      setError("パスワードの更新に失敗しました。");
    }
  };

  const handleSignOut = () => {
    auth.signOut();
    navigate("/login");
  };

  const goBack = () => {
    navigate(-1); // 前のページに戻る
  };

  return (
    <div className="account-settings-container">
      <div className="back-button" onClick={goBack}>
        <FiArrowLeft size={24} />
        <span>戻る</span>
      </div>
      
      <h2>アカウント設定</h2>

      {error && <p className="error-message">{error}</p>}

      <div className="form-group">
        <label>ユーザー名</label>
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          placeholder="新しいユーザー名"
        />
        <button onClick={handleUsernameChange} disabled={isSubmitting}>
          {isSubmitting ? "更新中..." : "ユーザー名更新"}
        </button>
      </div>

      <div className="form-group">
        <label>メールアドレス</label>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="新しいメールアドレス"
        />
        <button onClick={handleEmailChange} disabled={isSubmitting}>
          {isSubmitting ? "更新中..." : "メールアドレス更新"}
        </button>
      </div>

      <div className="form-group">
        <label>現在のパスワード</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="現在のパスワード"
        />
      </div>

      <div className="form-group">
        <label>新しいパスワード</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="新しいパスワード"
        />
        <button onClick={handlePasswordChange} disabled={isSubmitting}>
          {isSubmitting ? "更新中..." : "パスワード更新"}
        </button>
      </div>

      <div className="form-group">
        <button onClick={handleSignOut}>ログアウト</button>
      </div>
    </div>
  );
};

export default AccountSettings;
