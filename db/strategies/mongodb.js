const Icrud = require("./interface/Icrud");
const Mongoose = require("mongoose");

const STATUS = {
    0: 'Disconectado',
    1: 'Conectado',
    2: 'Conectando',
    3: 'Disconectando'
}

const connection = Mongoose.connection;

class MongoDB extends Icrud {
  constructor() {
    super();
    this._herois = null
    this._driver = null
  }

  async isConected() {
    const state = STATUS[this._driver.readyState]
    if(state === 'Conectado') return state;
    if(state !== 'Conectando') return state
    await new Promise(resolve => setTimeout(resolve, 1000))

    return STATUS[this._driver.readyState]
    
  }
  defineModel() {
    if (!this._herois) {
      const heroiSchema = new Mongoose.Schema({
        nome: {
          type: String,
          required: true,
        },
        poder: {
          type: String,
          required: true,
        },
        insertedAt: {
          type: Date,
          default: new Date(),
        },
      });
      this._herois = Mongoose.model('herois', heroiSchema);
    }
  }
  
  connect() {
    Mongoose.connect(
      "mongodb://admin:senhaadmin@localhost:27017/herois?authSource=admin",
      { useNewUrlParser: true }
    ).catch((error) => {
      if (!error) return;
      console.log("Falha na conexão!", error);
    });
    const connection = Mongoose.connection
    this._driver = connection
    connection.once('open', () => console.log('Database rodando'))
    this.defineModel()
  }

  create(item) {
    return this._herois.create(item)
  }
  //o skip ira pular os 10 ou mais primeiros resultados do banco de dados
  read(item, skip=0, limit=10){
    return this._herois.find(item).skip(skip).limit(limit)
  }

  update(id, item) {
    return this._herois.updateOne({ _id: id}, {$set: item })
  }

  delete(id) {
    return this._herois.deleteOne({ _id: id})
  }

}

module.exports = {
  MongoDB, // Export a class
  isConnected: MongoDB.isConnected // Export the isConnected function
};