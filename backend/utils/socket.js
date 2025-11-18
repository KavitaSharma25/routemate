let ioInstance = null

/**
 * Initialize Socket.io instance
 * Stores the Socket.io instance for global access
 */
function init(io){
  ioInstance = io
}

/**
 * Get Socket.io instance
 * Returns the initialized Socket.io instance for emitting events
 */
function getIO(){
  if (!ioInstance) throw new Error('Socket.io not initialized')
  return ioInstance
}

module.exports = { init, getIO }
