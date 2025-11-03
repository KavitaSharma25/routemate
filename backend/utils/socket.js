let ioInstance = null

function init(io){
  ioInstance = io
}

function getIO(){
  if (!ioInstance) throw new Error('Socket.io not initialized')
  return ioInstance
}

module.exports = { init, getIO }
