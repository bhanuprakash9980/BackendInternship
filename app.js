const express=require('express');
const expressLayouts = require('express-ejs-layouts');
const axios=require("axios");
const cheerio=require("cheerio");
const fs=require('fs');
const bodyParser=require('body-parser');
const app = express();

const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.static(__dirname + '/public'));
app.set('views',__dirname+'/views');
app.set('view engine', 'ejs');
app.get('/',(req,res)=>{
    res.render('index');
});
app.get('/result',(req,res)=>{
    res.render('result');
});
app.post('/amazonsearch',urlencodedParser,(req,res)=>{
    const writeStream=fs.createWriteStream('./public/post.csv');
    let x=req.body.products.split('\r\n');
   
    let arr= x.filter((val,i,x)=>{
        if(val[0]!=' ')
         return val;
    });
       
writeStream.write(`Product Name, Average Price \n`);
arr.forEach( async(val)=>{
   await axios.get('https://www.amazon.in/s?k='+val).then((response)=>{
      html=response.data;
       const $ =  cheerio.load(html);
       let count=0;
       let sum=0.00;
         $('[data-component-type=s-search-result]').each((i,el)=>{
           if(count==20)
            return false;
           let price= $(el).find('.a-price-whole').html();
           if(price!=null)
           {count++;
             price=price.replace(/,/g,'');
             sum+=parseInt(price);
           }
        
       });
       sum=sum/count;
      writeStream.write(`${val}, ${sum} \n`);
               
   });
  
});
console.log('scrapping done');
res.redirect('/result');
});

app.listen(3000,()=>console.log("Server started"));

 

