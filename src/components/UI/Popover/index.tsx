import React, { useState, useRef, useEffect } from "react";

interface PopoverProps {
  triggerContent: React.ReactNode; // 트리거 버튼의 내용
  popoverContent: React.ReactNode; // 팝오버 내부 내용
}

const Popover: React.FC<PopoverProps> = ({
  triggerContent,
  popoverContent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const togglePopover = () => setIsOpen((prev) => !prev);

  // 팝오버 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div
      className="popover-container"
      style={{ position: "relative", display: "inline-block" }}
    >
      <button
        onClick={togglePopover}
        style={{
          cursor: "pointer",

          width: "100px",
        }}
      >
        {triggerContent}
      </button>
      {isOpen && (
        <div
          ref={popoverRef}
          className="popover-content"
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "8px",
            padding: "10px",
            backgroundColor: "#838B9C",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: "4px",
            zIndex: 1000,
          }}
        >
          {popoverContent}
        </div>
      )}
    </div>
  );
};

export default Popover;
