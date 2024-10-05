import { PrismaClient } from '@prisma/client'
import z, { number } from 'zod'
import bcrypt from 'bcrypt'
const prisma = new PrismaClient()
const express = require("express")
const cors = require('cors')
const app = express()
const corsOptions = {
  origin: 'http://127.0.0.1:5500', 
  methods: 'GET,POST,PUT,DELETE,PATCH', 
  allowedHeaders: ['Content-Type', 'Authorization'], 
}

//CRUD----------------------------------------------------------------------------------------------------------------------------------

//USER
async function createUser(login: any, password: string, email: any) {
  const response = await prisma.user.findUnique({ where: { email: email } });
  if (response == null) {
    const User = z.object({
      login: z.string(),
      password: z.string(),
      email: z.string().email()
    })
    let verification = User.safeParse({ login: login, password: password, email: email })
    if (verification.success) {
      let hashPass=(await hashingPassword(password)).toString()
      await prisma.user.create({
        data: {
          login: login,
          email: email,
          password: hashPass
        }
      })
      const UserRestricted={
        "login":login,"password":password,"email":email
      }
      return UserRestricted;
    } else {
      return null;
    }
  } else { 
    return null;
  }
}
async function findUser(login: any,password: any) {
  const User = await prisma.user.findUnique({where: { login: login } })
  if (User == null) {return null;}
  else {
    let pass=User.password;
    let bool=compareHash(pass,password);
    if(await bool){
      const UserRestricted=await prisma.user.findUnique({where: { login: login },select:{login:true,email:true,evaluations: true}})
      return UserRestricted;
    }else{
      return null;
    }
  }
}
async function findAllUsers() {
  const allUsers = await prisma.user.findMany({
    select: {login:true,email:true,evaluations: true,},
  })
  return allUsers;
}
async function updateUser(login: any, password: any, typeOfChange: String, change: any) {
  const changed = z.string()
  let verification = changed.safeParse(change)
  let response = await prisma.user.findUnique({ where: { login: login} })
  if(response==null){return false}
  let bool=compareHash(response.password,password);
  if (verification.success && await bool) {
    switch (typeOfChange) {
      case "login":
        await prisma.user.update({
          where: { login: login },
          data: { login: change }
        })
        break
      case "password":
        let hashPass=(await hashingPassword(change)).toString()
        await prisma.user.update({
          where: { login: login },
          data: { password: hashPass }
        })
        break
      default:
        break
    }
    return true
  } else {
    return false
  }
}
async function deleteUser(login: any, password: any) {
  let response=await prisma.user.findUnique({ where: { login: login} })
  if (response!= null) {
    let bool=compareHash(response.password,password)
    if(await bool){
      const UserRestricted= await prisma.user.findUnique({where:{login:login},select:{login:true,email:true,evaluations: true}})
      await prisma.user.delete({ where: { login: login }})
      return UserRestricted;
    }else{return null}
  } else {
    return null
  }
}
async function hashingPassword(password: string) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds).then(function (hash) {
    return hash;
  })
}
async function compareHash(hash: string, password: string):Promise<boolean>{
  const result = await bcrypt.compare(password, hash)
  return result
}

//EVALUATION
async function createEvaluation(evalName:any,stars:any,review:any,authorEmail:any,movieName:any) {
  const response = await prisma.evaluation.findUnique({ where: { evalName:evalName } });
  const equalUserMovieResponse =await prisma.evaluation.findFirst({ where:{ authorEmail:authorEmail,movieName:movieName} });
  const userResponse = await prisma.user.findUnique({where:{email:authorEmail}});
  const movieResponse = await prisma.movie.findUnique({where:{name:movieName}})
  if (response == null&&equalUserMovieResponse==null&&userResponse!=null&&movieResponse!=null) {
    const Evaluation=z.object({
      evalName:z.string(),
      stars:z.number().min(0).max(5),
      authorEmail:z.string().email(),
      movieName:z.string()
    })
    let verification = Evaluation.safeParse({evalName:evalName,stars:stars,authorEmail:authorEmail,movieName:movieName})
    if(verification.success){
      await prisma.evaluation.create({
        data:{
          evalName:evalName,
          stars:stars,
          review:review,
          authorEmail:authorEmail,
          movieName:movieName
        }
      })
      const Evaluation=await prisma.evaluation.findUnique({where:{evalName:evalName},select:{evalName:true,stars:true,review:true,authorEmail:true,movieName:true}})
      return Evaluation;
    }else{return null}
  }else{return null}
}
async function findEvaluation(evalName:any) {
  const EvaluationRestricted=await prisma.evaluation.findUnique({where:{evalName:evalName},select:{evalName:true,stars:true,review:true,authorEmail:true,movieName:true}})
  return EvaluationRestricted;
}
async function findAllEvaluations() {
  const allEvaluations=await prisma.evaluation.findMany({select:{evalName:true,stars:true,review:true,authorEmail:true,movieName:true}})
  return allEvaluations;
}
async function updateEvaluation(evalName:any,typeOfChange:string,change:any){
  const response=await prisma.evaluation.findUnique({where:{evalName:evalName}})
  if(response!=null){
    switch(typeOfChange){
      case "evalName":
        await prisma.evaluation.update({
          where:{evalName:evalName},
          data:{evalName:change}
        })
        evalName=change
        break;
      case "stars":
        change=parseFloat(change)
        await prisma.evaluation.update({
          where:{evalName:evalName},
          data:{stars:change}
        })
        break;
      case "review":
        await prisma.evaluation.update({
          where:{evalName:evalName},
          data:{review:change}
        })
        break;
      default:
        break;
    }
    const EvaluationRestricted = await prisma.evaluation.findUnique({where:{evalName:evalName},select:{evalName:true,stars:true,review:true,authorEmail:true,movieName:true}})
    return EvaluationRestricted
  }else{return null}
}
async function deleteEvaluation(evalName:any) {
  const response=await prisma.evaluation.findUnique({where:{evalName:evalName},select:{evalName:true,stars:true,review:true,authorEmail:true,movieName:true}})
  if(response!=null){
    await prisma.evaluation.delete({where:{evalName:evalName}})
  }
  return response
}
async function deleteAllEvaluationsUser(authorEmail:any){
  await prisma.evaluation.deleteMany({where:{authorEmail:authorEmail}})
}
async function deleteAllEvaluationsMovie(movieName:any){
  await prisma.evaluation.deleteMany({where:{movieName:movieName}})
}

//MOVIE
async function createMovie(name:string,synopsis:string) {
  const response = await prisma.movie.findUnique({where:{name:name}})
  if(response==null){
    const MovieName=z.string();
    const MovieSynopsis=z.string();
    let verificationN=MovieName.safeParse(name);
    let verificationS=MovieSynopsis.safeParse(synopsis)
    if(verificationN.success&&verificationS.success){
      await prisma.movie.create({
        data:{
          name:name,
          synopsis:synopsis
      }})
      const MovieRestricted=await prisma.movie.findUnique({where:{name:name},select:{name:true,synopsis:true,evaluations:true}})
      return MovieRestricted
    }
    else{return null}
  }else{return null}
}
async function findAllMovies() {
  const allMovies= await prisma.movie.findMany({
    select:{name:true,synopsis:true,evaluations:true,img:true}
  })
  return allMovies;
}
async function findMovie(name:any) {
  const Movie= await prisma.movie.findUnique({where:{name:name},select:{name:true,synopsis:true,evaluations:true,img:true}})
  if(Movie==null){return null}
  else{
    return Movie
  }
}
async function updateMovie(name:any,newSynopsis:any) {
  const response= await prisma.movie.findUnique({where:{name:name}})
  if(response!=null){
    await prisma.movie.update({where:{name:name},data:{synopsis:newSynopsis}})
    const Movie=await prisma.movie.findUnique({where:{name:name},select:{name:true,synopsis:true,evaluations:true}})
    return Movie
  }
  else{return null}
}
async function deleteMovie(name:any) {
  let response=await prisma.movie.findUnique({where:{name:name},select:{name:true,synopsis:true,evaluations:true}})
  if(response!=null){
    await prisma.movie.delete({where:{name:name}})
    return response
  }else{return null}
}

//MAIN----------------------------------------------------------------------------------------------------------------------------------
async function main() {
}
main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

//CONTROLLERS----------------------------------------------------------------------------------------------------------------------------------
app.use(express.json());
app.use(cors());
app.listen(3000, () => { console.log("Listening in port 3000") })

//USER
app.get('/user/getAll', async (req: any, res: any) => {
  const posts = await findAllUsers();
  res.json(posts)
})
app.get('/user/get/:login&:password',async(req: { params: { password: any; login: any } },res:any)=>{
  const {password}=req.params
  const {login}=req.params
  const User=await findUser(login,password);
  res.json(User)
})
app.post(`/user/post`, async (req: { body: { login: string; password: string; email: string } }, res: { json: (arg0: { login: any; email: any; password: string } | null) => void }) => {
  const User = req.body
  const result=await createUser(User.login,User.password,User.email);
  res.json(result)
})
app.delete(`/user/delete/:login&:password`, async (req: { params: { login: any; password: any } }, res: any) => {
  const {login} = req.params
  const {password} =req.params
  const User =await findUser(login,password)
  if(User!=null){await deleteAllEvaluationsUser(User.email)}
  const post = await deleteUser(login,password)
  res.json(post)
})
app.put('/user/put/:login&:password&:typeOfChange&:change', async (req: { params: { login: any; password: any; typeOfChange: any; change: any } }, res: any) => {
  const {login} = req.params
  const {password} =req.params
  const {typeOfChange} = req.params
  const {change} =req.params
  let bol=await updateUser(login,password,typeOfChange,change);
  let post;
  if(bol){switch(typeOfChange){
    case "login":
      post=await prisma.user.findUnique({where:{login:change},select:{login:true,email:true,evaluations: true}})
      break
    default:
      post=await prisma.user.findUnique({where:{login:login},select:{login:true,email:true,evaluations: true}})
      break
  }}else{post=null}
  console.log(post)
  res.json(post)
})

//EVALUATION
app.post(`/evaluation/post`,async (req: { body: {evalName:string,stars:number,review?:string,authorEmail:string,movieName:string} },res: any)=>{
  const Evaluation=req.body;
  const result=await createEvaluation(Evaluation.evalName,Evaluation.stars,Evaluation.review,Evaluation.authorEmail,Evaluation.movieName)
  res.json(result)
})
app.get(`/evaluation/get/:evalName`,async(req: { params: { evalName: any } },res:any)=>{
  const {evalName}=req.params
  const result=await findEvaluation(evalName)
  res.json(result)
})
app.get(`/evaluation/getAll`,async(req:any,res:any)=>{
  const posts=await findAllEvaluations();
  res.json(posts);
})
app.put(`/evaluation/put/:evalName&:typeOfChange&:change`,async(req: { params: { evalName: string; typeOfChange: string; change: string } },res: any)=>{
  const {evalName}=req.params
  const {typeOfChange}=req.params
  const {change}=req.params
  const post=await updateEvaluation(evalName,typeOfChange,change)
  res.json(post)
})
app.delete(`/evaluation/delete/:evalName`,async(req: { params: { evalName: any } },res: any)=>{
  const {evalName}=req.params
  const post=await deleteEvaluation(evalName)
  res.json(post)
})

//MOVIE
app.post(`/movie/post`,async (req: { body: { name: string ,synopsis:string} },res: any)=>{
  const {name,synopsis} = req.body;
  const result = await createMovie(name,synopsis);
  res.json(result)
})
app.get(`/movie/getAll`,async (req:any,res:any)=>{
  const posts= await findAllMovies();
  res.json(posts);
})
app.get(`/movie/get/:name`,async(req: { params: { name: any } },res: any)=>{
  const {name}=req.params;
  const Movie=await findMovie(name)
  res.json(Movie)
})
app.put(`/movie/put`,async(req: { body: {name: any; synopsis: any } },res: any)=>{
  const Movie=req.body
  const post=await updateMovie(Movie.name,Movie.synopsis)
  res.json(post)
})
app.patch(`/movie/patch`,async(req: { body: { name?: any; img?: any } },res:any)=>{
  const Movie=req.body
  const Movie1=await prisma.movie.findUnique({where:{name:Movie.name}})
  let bol;
  if(Movie1!=null){
    bol={"img":true}
    await prisma.movie.update({where:{name:Movie.name},data:{img:Movie.img}})
  }else{bol={"img":false}}
  res.json(bol)
})
app.delete(`/movie/delete/:name`,async(req: { params: { name: any } },res: any)=>{
  const {name}=req.params
  await deleteAllEvaluationsMovie(name)
  const post =await deleteMovie(name)
  res.json(post)
})