import React, { useState, useEffect } from "react";

type Log = {
  type: "log" | "error" | "warn";
  message: string;
};

const Logger: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      setLogs((prevLogs) => [
        ...prevLogs,
        { type: "log", message: args.join(" ") },
      ]);
      originalLog(...args);
    };

    console.error = (...args) => {
      setLogs((prevLogs) => [
        ...prevLogs,
        { type: "error", message: args.join(" ") },
      ]);
      originalError(...args);
    };

    console.warn = (...args) => {
      setLogs((prevLogs) => [
        ...prevLogs,
        { type: "warn", message: args.join(" ") },
      ]);
      originalWarn(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",

          columnGap: "10px",

          marginBottom: "10px",
        }}
      >
        <h2>Error Logger</h2>
        <button
          onClick={() => setLogs([])}
          style={{
            padding: "5px 10px",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Clear Logs
        </button>
      </div>
      <div
        style={{
          width: "100%",
          backgroundColor: "#838B9C",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "5px",
          height: "300px",
          overflowY: "scroll",
        }}
      >
        {logs.map((log, index) => (
          <div
            key={index}
            style={{
              fontSize: "14px",
              lineHeight: "1.5",
              color:
                log.type === "error"
                  ? "red"
                  : log.type === "warn"
                  ? "orange"
                  : "black",
            }}
          >
            [{log.type.toUpperCase()}] {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Logger;
