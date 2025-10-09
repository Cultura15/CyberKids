import React, { createContext, useContext } from "react";
import { useStudentStatus } from "../hooks/useStudentStatus";

const StudentStatusContext = createContext();

export const StudentStatusProvider = ({ children }) => {
  const hook = useStudentStatus(); // keeps one WebSocket for all pages
  return (
    <StudentStatusContext.Provider value={hook}>
      {children}
    </StudentStatusContext.Provider>
  );
};

export const useStudentStatusContext = () => useContext(StudentStatusContext);
