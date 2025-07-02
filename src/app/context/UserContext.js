"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [token, setToken] = useState("");
  const [money, setMoney] = useState(0);
  const [subscribedGroups, setSubscribedGroups] = useState([]);

  useEffect(() => {
    const savedMoney = localStorage.getItem("money");
    if (savedMoney !== null) {
      setMoney(parseFloat(savedMoney));
    }

    const savedSubscribedGroups = localStorage.getItem("subscribedGroups");
    if (savedSubscribedGroups) {
      setSubscribedGroups(JSON.parse(savedSubscribedGroups));
    }

    const savedUserName = localStorage.getItem("userName");
    if (savedUserName) {
      setUserName(savedUserName);
    }

    const savedPhone = localStorage.getItem("phoneNumber");
    if (savedPhone) {
      setPhoneNumber(savedPhone);
    }

    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // ✅ تحديث تلقائي للرصيد عند تغيّره في localStorage (مثلاً بعد الشحن)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "money") {
        setMoney(parseFloat(event.newValue) || 0);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  function login({ userName, phoneNumber, token, money }) {
    setUserName(userName || "");
    setPhoneNumber(phoneNumber || "");
    setToken(token || "");
    setMoney(money !== undefined ? parseFloat(money) : 0);

    localStorage.setItem("userName", userName || "");
    localStorage.setItem("phoneNumber", phoneNumber || "");
    localStorage.setItem("token", token || "");
    localStorage.setItem("money", money !== undefined ? money.toString() : "0");
  }

  function addSubscribedGroup(groupId) {
    if (!subscribedGroups.includes(groupId)) {
      const updated = [...subscribedGroups, groupId];
      setSubscribedGroups(updated);
      localStorage.setItem("subscribedGroups", JSON.stringify(updated));
    }
  }

  function logout() {
    setUserName("");
    setPhoneNumber("");
    setToken("");
    setMoney(0);
    setSubscribedGroups([]);

    localStorage.removeItem("userName");
    localStorage.removeItem("phoneNumber");
    localStorage.removeItem("token");
    localStorage.removeItem("money");
    localStorage.removeItem("subscribedGroups");
    localStorage.removeItem("wallet_balance");
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentDataComplete");
  }

  return (
    <UserContext.Provider
      value={{
        userName,
        phoneNumber,
        token,
        money,
        setMoney,
        subscribedGroups,
        addSubscribedGroup,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
