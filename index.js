const { ObjectId,MongoClient } = require("mongodb") ;
const express = require('express');
const dotenv = require('dotenv').config();
const app = express();
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

const client = new MongoClient(process.env.MONGODB_URI); 

client.connect().then((res) => {
    console.log('db connected');
    const db = client.db('CodeWaikas');
    const collection = db.collection('Waikastar');
    // let changeStream = collection.watch();
    // changeStream.on("change", next => {
        //     // process any change event
    //     if (next.operationType == 'update') {
        //         res.send('updated')
        //     }
        //     console.log("received a change to the collection: \t", next);
        // });
}).catch((err) => {
    console.log(err);
})


const server = app.listen(PORT, err => {
  if(err) throw err;
  console.log("%c Server running", "color: green");
});

const io = require('socket.io')(server); 
io.use(async (socket, next) => {
    try {
      const name = socket.handshake.query.name;
      const admin = socket.handshake.query.admin; 
      socket.name = name;
      socket.admin = admin;
      next();
    } catch (err) {}
  });
io.on("connection", (socket) => {
    console.log("connected" + socket.name);
    console.log(socket.admin)
    socket.on("disconnect", () => {
        console.log("Disconnected: " + socket.name);
    });

    socket.on('startGame', (message) => {
        if(message === 'basyldy') {
            socket.emit("startGame", {
                message: 'basyldy'
            })
        }
        console.log(message);
    })
})  

app.delete('/waikastar/delete/:id', async (req, res) => {
    const db = client.db('CodeWaikas');
    const collection = db.collection('Waikastar');
    const id = req.params.id.trim();
    const val = await collection.findOne({"_id": new ObjectId(id)});
    console.log(val)
    const result = await collection.deleteOne({"_id": ObjectId(id)});
    console.log(result);
    res.send('owti');
})

app.get('/', (req,res) => {
    
    res.send("hello world");
});

app.get('/waikastar', async (req,res) => {
    const db = client.db('CodeWaikas');
    const collection = db.collection('Waikastar');
    const waikastar = await collection.find({}).toArray();
    
    res.send(waikastar)

});

app.get('/waikastar/:id', async (req, res) => {
    const db = client.db('CodeWaikas');
    const collection = db.collection('Waikastar');
    console.log(req.params.id);
    const id = req.params.id.trim().split('"').join('');
    const waikas = await collection.find({ _id: new ObjectId(id) }).toArray();
    res.send(waikas);
})
app.post('/waikastar', async (req,res) => {
    console.log(req.body);
    console.log('------');
    const {  users, problemName } = req.body;
    const problemLink = 'https://leetcode.com/problems/' + problemName.toString().trim().toLowerCase().split(' ').join('-');
    const problem = { name: problemName, link: problemLink }; 
    const started = false;

    
    const db = client.db('CodeWaikas');
    const collection = db.collection('Waikastar');

    const result = await collection.insertOne({
        users,
        problem,
        started
    });

    console.log(result);
    console.log('-----');
    console.log(result.insertedId)

    res.send(result.insertedId)

});

app.put('/waikastar/join/:id', async (req, res) => {
    console.log(req.body);

    const user = { name: req.body.userName, admin: false, time: -1, space: -1, tc: -1};
    const id = req.params.id.trim().split('"').join('');
    console.log((req.params.id));

    const db = client.db('CodeWaikas');
    const collection = db.collection('Waikastar');

    await collection.updateOne(
        {
            _id: new ObjectId(id),
        },
        {
            $push: { users: user }
        }
    );

    res.send('kosyldy');
});
app.put('/waikastar/:id/:userName', async (req, res) => {
    console.log(req.body);
    console.log(req.params)
    const id = (req.params.id).toString().trim().split('"').join('');
    console.log(id);
    const userName = req.params.userName;
    console.log(userName);

    const db = client.db('CodeWaikas');
    const collection = db.collection('Waikastar');

    await collection.updateOne(
        {
            _id: new ObjectId(id.trim()),
        },
        {
            $pull: { users: { name: userName } }
        }

    );
    res.send('wykty')
})
