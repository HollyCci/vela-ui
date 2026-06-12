import { useState, type MouseEvent } from 'react';
import './showcase.css';
import { CATEGORIES, demoRegistry, titleOf } from './registry';

const App = () => {
  const [activeId, setActiveId] = useState('button');

  const handleItemClick = (e: MouseEvent<HTMLButtonElement>) => {
    const id = e.currentTarget.dataset.id;
    if (id) setActiveId(id);
  };

  const demo = demoRegistry[activeId];

  return (
    <div className="sc-layout">
      <aside className="sc-sidebar">
        <div className="sc-sidebar__brand">HeroUI Replica</div>
        {Object.entries(CATEGORIES).map(([category, ids]) => (
          <div key={category}>
            <div className="sc-sidebar__group">{category}</div>
            {ids.map((id) => (
              <button
                key={id}
                type="button"
                data-id={id}
                onClick={handleItemClick}
                className={[
                  'sc-sidebar__item',
                  id === activeId ? 'sc-sidebar__item--active' : '',
                  demoRegistry[id] ? '' : 'sc-sidebar__item--todo',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {titleOf(id)}
              </button>
            ))}
          </div>
        ))}
      </aside>
      <main className="sc-main">
        <h1 className="sc-main__title">{titleOf(activeId)}</h1>
        <p className="sc-main__subtitle">
          样式源自 HeroUI Pro 提取的 CSS（src/styles/components/{activeId}.css）
        </p>
        {demo ?? (
          <div className="sc-todo">
            该组件的 CSS 已就绪（src/styles/components/{activeId}.css），React 封装待实现。
          </div>
        )}
      </main>
    </div>
  );
};

App.displayName = 'App';

export default App;
