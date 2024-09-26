import { MermaidRenderer } from "./components/MermaidRenderer";

function App() {
  const graphText = `
    pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15

  `; 
  return (
    <MermaidRenderer graphText={graphText}></MermaidRenderer>
  )
}

export default App
