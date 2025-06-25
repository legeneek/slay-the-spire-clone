import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameEngine } from "../hooks/useGameEngine";
import { GameController } from "../../engine/GameController";
import CardComponent from "../components/CardComponent";
import RelicPedestal from "../components/shop/RelicPedestal";

const CardRemovalService = ({
  cost,
  canAfford,
  onPurchaseClick,
}: {
  cost: number;
  canAfford: boolean;
  onPurchaseClick: () => void;
}) => (
  <motion.div
    className={`shop-service-remove ${
      canAfford ? "can-afford" : "cannot-afford"
    }`}
    onClick={canAfford ? onPurchaseClick : undefined}
    whileHover={
      canAfford ? { y: -5, boxShadow: "0px 8px 15px rgba(0,0,0,0.2)" } : {}
    }
  >
    <div className="item-icon">✂️</div>
    <div className="item-name">Card Removal</div>
    <p>Remove a card from your deck permanently.</p>
    <div className="item-cost">{cost}g</div>
  </motion.div>
);

export default function ShopScreen() {
  const { player, currentShop } = useGameEngine();
  const [view, setView] = useState<"MAIN" | "REMOVAL">("MAIN");

  if (!player || !currentShop) return <div>Entering Shop...</div>;

  const handleBuyCard = (cardId: string) =>
    GameController.buyItem("CARD", cardId);
  const handleBuyRelic = (relicId: string) =>
    GameController.buyItem("RELIC", relicId);
  const handleRemoveCard = (cardId: string) => {
    GameController.removeCardFromDeck(cardId);
    setView("MAIN"); // Go back to main shop view
  };

  const renderMainView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="wares-section">
        <h3 style={{ color: "#fff" }}>Cards</h3>
        <AnimatePresence>
          <div className="wares-grid">
            {currentShop.cards.map((cardOnSale) => {
              const dummyInstance = {
                instanceId: `shop-${cardOnSale.id}`, // A predictable, unique ID for React's key prop
                definition: cardOnSale,
                currentCost: cardOnSale.cost,
                isUpgraded: cardOnSale.name.endsWith("+"), // A simple heuristic for display
              };
              const canAfford = player.gold >= cardOnSale.price;
              return (
                <div
                  key={cardOnSale.id}
                  className={`shop-card-wrapper ${
                    !canAfford ? "cannot-afford" : ""
                  }`}
                >
                  <CardComponent
                    card={dummyInstance}
                    context={{
                      type: "deck-view", // deck-view styling is similar to shop
                      onSelect: () => canAfford && handleBuyCard(cardOnSale.id),
                      isSelectable: canAfford,
                    }}
                  />
                  <div className="shop-item-cost">{cardOnSale.price}g</div>
                </div>
              );
            })}
          </div>
        </AnimatePresence>
      </div>
      <div className="wares-section">
        <h3 style={{ color: "#fff" }}>Relics & Services</h3>
        <div className="wares-grid">
          <AnimatePresence>
            {currentShop.relics.map((relicOnSale) => (
              <RelicPedestal
                key={relicOnSale.id}
                relic={relicOnSale}
                cost={relicOnSale.price}
                canAfford={player.gold >= relicOnSale.price}
                onPurchase={() => handleBuyRelic(relicOnSale.id)}
              />
            ))}
            <CardRemovalService
              cost={currentShop.removeServiceCost}
              canAfford={player.gold >= currentShop.removeServiceCost}
              onPurchaseClick={() => setView("REMOVAL")}
            />
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );

  const renderRemovalView = () => (
    <motion.div
      className="card-removal-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2>Select a Card to Remove ({currentShop.removeServiceCost}g)</h2>
      <div className="deck-grid">
        {player.deck.map((card) => (
          <CardComponent
            key={card.instanceId}
            card={card}
            context={{
              type: "deck-view",
              onSelect: () => handleRemoveCard(card.instanceId),
              isSelectable: true, // All cards can be removed
            }}
          />
        ))}
      </div>
      <button onClick={() => setView("MAIN")}>Back to Shop</button>
    </motion.div>
  );

  return (
    <div className="shop-screen-refactored">
      <div className="shop-header">
        <h2 style={{ color: "#fff" }}>The Merchant</h2>
        <span className="gold-display">💰 {player.gold}</span>
        <button
          className="leave-button"
          onClick={() => GameController.finishNodeActivity()}
        >
          Leave
        </button>
      </div>
      <AnimatePresence mode="wait">
        {view === "MAIN" ? renderMainView() : renderRemovalView()}
      </AnimatePresence>
    </div>
  );
}
