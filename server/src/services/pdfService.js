import puppeteer from "puppeteer"
import ejs from "ejs"
import fs from "fs"
import path from "path"

export const generatePDF = async(data)=>{

 const html = await ejs.renderFile(
  "./src/templates/pdfTemplate.ejs",
  {
    ...data,
    lecture_title: data.lecture_title || "Untitled Lecture",
    date: data.date || new Date().toLocaleDateString(),
    topics: data.topics || []
  }
 )

//  const browser = await puppeteer.launch({
//   args: ['--no-sandbox', '--disable-setuid-sandbox']
//  })
const browser = await puppeteer.launch({
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--single-process'
  ],
  headless: true
})

 const page = await browser.newPage()

 await page.setContent(html, { waitUntil: 'networkidle0' })

 // Give mermaid and layout 1.5 seconds to fully render before taking the snapshot
 await new Promise(resolve => setTimeout(resolve, 1500));

 const pdfBuffer = await page.pdf({
  format:"A4",
  printBackground:true,
  displayHeaderFooter: true,
  headerTemplate: "<div></div>",
  footerTemplate: `
   <div style="width: 100%; font-size: 10px; padding: 0 50px; color: #000; display: flex; justify-content: center; font-family: 'Patrick Hand', cursive; margin-bottom: 20px;">
       <span>- Page <span class="pageNumber"></span> -</span>
   </div>
  `,
  margin: {
   top: "40px",
   bottom: "80px",
   left: "50px",
   right: "50px"
  }
 })

 await browser.close()

 return pdfBuffer
}