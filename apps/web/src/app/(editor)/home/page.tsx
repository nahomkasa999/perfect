"use client"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import React from "react";
import AIPrompt from "./_components/AI";


export default function App() {
  const [isopened, setIsopened]  = React.useState(false)
  React.useEffect(() => {
    window.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key === "g") {
        event.preventDefault();
        setIsopened((prev) => !prev)
        console.log("Ctrl + G was pressed!");
        
      }
    });
  }, []);

  return (
    <div>
      {
        isopened && <AIPrompt/>
      }
      <SimpleEditor />
      
    </div>
  );
}
