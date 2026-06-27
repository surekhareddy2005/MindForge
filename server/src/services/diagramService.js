export const generateConceptMap = (topics)=>{

 let diagram = "graph TD\n"

  if (topics && Array.isArray(topics) && topics.length > 1) {
   for(let i=0; i < topics.length - 1; i++){
    // Safely construct nodes by stripping quotes and wrapping the display text in [" "]
    const title1 = (topics[i]?.title || "Untitled Topic").replace(/"/g, "'");
    const title2 = (topics[i+1]?.title || "Untitled Topic").replace(/"/g, "'");
    
    diagram += `  node_${i}["${title1}"] --> node_${i+1}["${title2}"]\n`
   }
  } else if (topics && Array.isArray(topics) && topics.length === 1) {
    const title = (topics[0]?.title || "Untitled Topic").replace(/"/g, "'");
    diagram += `  node_0["${title}"]\n`
  }

 return diagram
}