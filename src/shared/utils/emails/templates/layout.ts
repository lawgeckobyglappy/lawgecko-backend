export function emailLayoutTemplate(header:string,content:string) {

  return `
          <html>
               <body>
                    <Header>
                    ${header}
                    </Header>

                    <main>
                    ${content}
                    </main>
                    
                    <Footer />
               </body>
          </html>
       `;

}
