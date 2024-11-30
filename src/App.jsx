import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home"; // Home コンポーネントのインポート
import Quiz from "./Quiz"; // Quiz コンポーネントのインポート
import Login from "./Login"; 
import Signup from "./Signup"; 
import AccountSettings from "./AccountSettings"; 

const App = () => {
  return (
    <Router>
      <div>
        {/* ルーティング設定 */}
        <Routes>
          <Route path="/" element={<Home />} /> {/* Home コンポーネントをルートとして設定 */}
          <Route path="/quiz" element={<Quiz />} /> {/* クイズページ */}
          <Route path="/login" element={<Login />} /> 
          <Route path="/signup" element={<Signup />} /> 
          <Route path="/accountSettings" element={<AccountSettings />} /> 
        </Routes>
      </div>
    </Router>
  );
};

export default App;
