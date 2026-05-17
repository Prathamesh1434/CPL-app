import { Server, Socket } from 'socket.io';
import { auctionEngine } from '../services/auction.service';

export function registerAuctionHandlers(io: Server, socket: Socket) {
  // Get current auction state
  socket.on('auction:state', () => {
    socket.emit('auction:state', auctionEngine.getState());
  });

  // Start auction for a group
  socket.on('auction:start', async (data: { groupId: string }) => {
    console.log(`[Socket] auction:start received for group: ${data.groupId}`);
    try {
      const state = await auctionEngine.startAuction(data.groupId);
      io.emit('auction:update', state);
      io.emit('auction:start', state);
      console.log(`[Socket] Auction started successfully for ${state.activeGroupName}`);
    } catch (err: any) {
      console.error(`[Socket] auction:start error: ${err.message}`);
      socket.emit('auction:error', { message: err.message });
    }
  });

  // Spin the wheel
  socket.on('auction:spin', async () => {
    try {
      const { selectedPlayer, spinIndex } = auctionEngine.spinWheel();

      // Emit spinning event with target index for animation
      io.emit('auction:spin', {
        poolSize: auctionEngine.getState().wheelPool.length + 1, // +1 because player not yet removed
        targetIndex: spinIndex,
        player: selectedPlayer,
      });

      // After animation delay, select the player
      setTimeout(() => {
        const state = auctionEngine.selectPlayer(selectedPlayer);
        io.emit('auction:selected', { player: selectedPlayer, state });
        io.emit('auction:update', state);
      }, 5000); // 5s for spin animation
    } catch (err: any) {
      socket.emit('auction:error', { message: err.message });
    }
  });

  // Place a bid
  socket.on('auction:bid', async (data: { captainId: string; amount: number }) => {
    try {
      const state = await auctionEngine.placeBid(data.captainId, data.amount);
      io.emit('auction:bid', {
        currentBid: state.currentBid,
        highestBidder: state.highestBidder,
      });
      io.emit('auction:update', state);
    } catch (err: any) {
      socket.emit('auction:error', { message: err.message });
    }
  });

  // Mark captain as out
  socket.on('auction:out', (data: { captainId: string }) => {
    try {
      const state = auctionEngine.markOut(data.captainId);
      io.emit('auction:update', state);
    } catch (err: any) {
      socket.emit('auction:error', { message: err.message });
    }
  });

  // Mark player as sold
  socket.on('auction:sold', async () => {
    try {
      const finalState = await auctionEngine.markSold();
      io.emit('auction:sold', finalState);
      // Send updated state after sold
      setTimeout(() => {
        io.emit('auction:update', auctionEngine.getState());
      }, 100);
    } catch (err: any) {
      socket.emit('auction:error', { message: err.message });
    }
  });

  // Mark player as unsold
  socket.on('auction:unsold', async () => {
    try {
      const finalState = await auctionEngine.markUnsold();
      io.emit('auction:unsold', finalState);
      // Send updated state after unsold
      setTimeout(() => {
        io.emit('auction:update', auctionEngine.getState());
      }, 100);
    } catch (err: any) {
      socket.emit('auction:error', { message: err.message });
    }
  });

  // Reset auction
  socket.on('auction:reset', () => {
    const state = auctionEngine.resetAuction();
    io.emit('auction:update', state);
  });
}
