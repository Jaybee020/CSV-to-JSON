const express=require("express")
const bodyparser=require("body-parser")
const mongoose=require("mongoose");
const csv=require("fast-csv")
const urlExist=require("url-exist")
const request=require("request");
const { json } = require("body-parser");
const app=express()
mongoose.connect("mongodb://localhost/Interview",
         {useNewUrlParser:true,
         useUnifiedTopology:true})
         .then(res => console.log('Connected to the databse succcessfully'))
         .catch(err => console.log("There was an error connecting to the database"));
app.use(bodyparser.json())

var ConversionSchema=mongoose.Schema({
    id: false ,
    conversion_key: mongoose.ObjectId,
    json:[]
})

var Conversion=mongoose.model("Conversion",ConversionSchema)



app.get("/",function(req,res){
  res.json("Hello there")
})




app.get("/:conversion_id",async(req,res)=>{
  const conversion_id = req.params.conversion_id
  try{
    const result =await Conversion.findById(conversion_id).exec()
    if(result){
      res.status(200).send({
        status:"success",
        json:result.json
      })
      }
      else{
        
      }
    
  }catch(err){
    res.status(400).send({
      status: "error",
      message: "The conversion key doesnt exist",
    });
  }
  
})


app.post("/",async(req,res)=>{
    const url=req.body.url
    const selected_fields=req.body.selected_fields

    if (!(url.trim())) {
      console.log(new Error("no url is given"))
      res.status(400).send({
        status: "error",
        message: "No given url file",
      });
    }

    if (!selected_fields) {
      console.log(new Error("no url is given"))
      res.status(400).send({
        status: "error",
        message: "No given selected fields",
      });
    }
    if (!Array.isArray(selected_fields)) {
      console.log(new Error("no url is given"))
      res.status(400).send({
        status: "error",
        message: "selected fields should be an array",
      });
    }


    const is_url_valid= await urlExist(url);
    console.log(is_url_valid)
    if(!is_url_valid){
      res.status(400).send({
        status: "error",
        message: "the url is not valid",
      });
    }

    console.log(req.body)
    var list=new Array
    var arr=[]
    var csvs=request(url)
    csv.parseStream(csvs)
      .on("error",(err)=>{console.log(err)
        res.status(400).send({
          status:"error",
          message:"The url is most likely not a valid one"
        })
      
      })
      .on("data", function(data){
        console.log("current data: ");
        console.log(data);
        list.push(data)
      
      })
      .on("end", function(){
        console.log("done reading");
        list=list.slice(0,list.length-1)
        console.log(list)
        var header=list[0]
        console.log(header)
        var index=[]
        var result=new Array
        
          for(let a=0;a<selected_fields.length;a++){
              var index_no= header.indexOf(selected_fields[a])
              index.push(index_no)}
          
        console.log(index)
        for(let i=1;i<list.length;i++){
          var map=new Map
          var obj=Object.fromEntries(map)
          for(let a =0;a<index.length;a++){
            map.set(header[index[a]],(list[i])[[index[a]]].trim());
            var obj=Object.fromEntries(map)
          }
          result.push(obj)

        }
        console.log(result)
        Conversion.create({json:result,conversion_key:new mongoose.Types.ObjectId()},function(err,conversion){
          if(err){
            console.log(err)
          }
          res.send({conversion_key:conversion.conversion_key,json:result})

        })
  })
   
    
    })

app.listen(8000,function(){
    console.log("We are listening")
})



