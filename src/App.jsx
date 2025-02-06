import { useState, useEffect, useCallback } from 'react';
import './App.css';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: 0 };
const INITIAL_SPEED = 150;

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    
    // Ensure food doesn't spawn on snake
    for (let segment of snake) {
      if (segment.x === newFood.x && segment.y === newFood.y) {
        return generateFood();
      }
    }
    
    setFood(newFood);
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    generateFood();
    setSpeed(INITIAL_SPEED);
  };

  const checkCollision = (head) => {
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    
    // Self collision
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return true;
      }
    }
    
    return false;
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused || direction.x === 0 && direction.y === 0) return;

    setSnake((prevSnake) => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;
      
      if (checkCollision(head)) {
        setGameOver(true);
        return prevSnake;
      }

      newSnake.unshift(head);
      
      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => {
          const newScore = prev + 1;
          if (newScore % 5 === 0) {
            setSpeed((prevSpeed) => Math.max(50, prevSpeed - 20));
          }
          return newScore;
        });
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, generateFood]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, speed);
    return () => clearInterval(gameLoop);
  }, [moveSnake, speed]);

  return (
    <div className="game-container">
      <div className="score-board">
        <div>Score: {score}</div>
        <div>Speed: {Math.round((INITIAL_SPEED / speed) * 100)}%</div>
      </div>
      
      <div className="grid">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE;
          const y = Math.floor(index / GRID_SIZE);
          const isSnake = snake.some(segment => segment.x === x && segment.y === y);
          const isFood = food.x === x && food.y === y;
          
          return (
            <div
              key={index}
              className={`cell ${isSnake ? 'snake' : ''} ${isFood ? 'food' : ''}`}
            />
          );
        })}
      </div>

      {gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}

      {isPaused && !gameOver && (
        <div className="paused">
          <h2>Paused</h2>
          <p>Press SPACE to resume</p>
        </div>
      )}

      <div className="controls">
        <p>Use arrow keys to move • SPACE to pause</p>
      </div>
    </div>
  );
};

export default SnakeGame;