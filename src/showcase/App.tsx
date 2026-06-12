import { useState, type MouseEvent } from 'react';
import './showcase.css';
import DemoFrame from './demo-frame';
import {
  BASE_CATEGORY,
  PRO_CATEGORIES,
  demoIndex,
  demoRegistry,
  sectionTitle,
  titleOf,
} from './registry';

type Device = 'mobile' | 'tablet' | 'desktop';

const DEVICE_WIDTH: Record<Device, number | '100%'> = {
  mobile: 375,
  tablet: 768,
  desktop: '100%',
};

type DemoSectionViewProps = {
  component: string;
  slug: string;
};

const DemoSectionView = ({ component, slug }: DemoSectionViewProps) => {
  const [device, setDevice] = useState<Device>('desktop');

  const handleDevice = (e: MouseEvent<HTMLButtonElement>) => {
    setDevice(e.currentTarget.dataset.device as Device);
  };

  return (
    <section className="sc-section">
      <h2 className="sc-section__title" id={slug}>
        {sectionTitle(component, slug)}
      </h2>
      <div className="sc-preview">
        <div className="sc-preview__bar">
          <span className="sc-preview__slug">{slug}</span>
          <div className="sc-preview__devices" role="radiogroup" aria-label="预览宽度">
            {(['mobile', 'tablet', 'desktop'] as Device[]).map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={device === d}
                data-device={d}
                onClick={handleDevice}
                className={device === d ? 'sc-preview__device sc-preview__device--on' : 'sc-preview__device'}
              >
                {d === 'mobile' ? 'Mobile' : d === 'tablet' ? 'Tablet' : 'Desktop'}
              </button>
            ))}
          </div>
        </div>
        <div className="sc-preview__stage">
          <DemoFrame slug={slug} width={DEVICE_WIDTH[device]} />
        </div>
      </div>
    </section>
  );
};

DemoSectionView.displayName = 'DemoSectionView';

const App = () => {
  const [activeId, setActiveId] = useState('action-bar');

  const handleItemClick = (e: MouseEvent<HTMLButtonElement>) => {
    const id = e.currentTarget.dataset.id;
    if (id) {
      setActiveId(id);
      window.scrollTo(0, 0);
    }
  };

  const slugs = [...(demoIndex[activeId] ?? [])].sort((a, b) => {
    const aDefault = a === `${activeId}-default` || a === activeId;
    const bDefault = b === `${activeId}-default` || b === activeId;
    if (aDefault !== bDefault) return aDefault ? -1 : 1;
    return a.localeCompare(b);
  });
  const reactDemo = demoRegistry[activeId];
  const isPro = slugs.length > 0;

  return (
    <div className="sc-app">
      <header className="sc-header">
        <div className="sc-header__brand">
          <span className="sc-header__logo">⬡</span> HeroUI Replica
        </div>
        <nav className="sc-header__nav">
          <span className="sc-header__nav-item sc-header__nav-item--on">Components</span>
        </nav>
        <div className="sc-header__meta">基准：heroui.pro 1.0.0-beta.5</div>
      </header>
      <div className="sc-body">
        <aside className="sc-sidebar">
          {Object.entries(PRO_CATEGORIES).map(([category, ids]) => (
            <div key={category}>
              <div className="sc-sidebar__group">{category}</div>
              {ids.map((id) => (
                <button
                  key={id}
                  type="button"
                  data-id={id}
                  onClick={handleItemClick}
                  className={
                    id === activeId ? 'sc-sidebar__item sc-sidebar__item--active' : 'sc-sidebar__item'
                  }
                >
                  {titleOf(id)}
                </button>
              ))}
            </div>
          ))}
          <div className="sc-sidebar__group">Base (React)</div>
          {BASE_CATEGORY.map((id) => (
            <button
              key={id}
              type="button"
              data-id={id}
              onClick={handleItemClick}
              className={
                id === activeId ? 'sc-sidebar__item sc-sidebar__item--active' : 'sc-sidebar__item'
              }
            >
              {titleOf(id)}
            </button>
          ))}
        </aside>
        <main className="sc-main">
          <h1 className="sc-main__title">{titleOf(activeId)}</h1>
          <p className="sc-main__subtitle">
            {isPro
              ? `${slugs.length} 个基准快照，采集自 heroui.pro 原站渲染 DOM，使用原站完整 CSS 渲染。`
              : '底层基础组件，React 实现演示。'}
          </p>
          {slugs.map((slug) => (
            <DemoSectionView key={slug} component={activeId} slug={slug} />
          ))}
          {reactDemo !== undefined && (
            <section className="sc-section">
              <h2 className="sc-section__title">React 实现（本仓库封装）</h2>
              <div className="sc-react-demo">{reactDemo}</div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

App.displayName = 'App';

export default App;
