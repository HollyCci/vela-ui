import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Carousel from './index';

// Embla 不调用 matchMedia / ResizeObserver / IntersectionObserver 的真实实现，
// 但在 jsdom 下相关 API 缺失会让 reInit 抛错；统一打桩，保证渲染稳定。
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
  if (!window.matchMedia) {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    }));
  }
});

const renderCarousel = (rootProps?: Record<string, unknown>) =>
  render(
    <Carousel {...rootProps}>
      <Carousel.Content>
        <Carousel.Item>Slide 1</Carousel.Item>
        <Carousel.Item>Slide 2</Carousel.Item>
        <Carousel.Item>Slide 3</Carousel.Item>
      </Carousel.Content>
      <Carousel.Previous />
      <Carousel.Next />
    </Carousel>,
  );

describe('Carousel', () => {
  // 回归：根 [data-slot=carousel] 必须有 aria-label，默认 'Carousel'
  it('root carousel has default aria-label "Carousel"', () => {
    renderCarousel();
    const root = document.querySelector('[data-slot="carousel"]');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('aria-label', 'Carousel');
  });

  // 回归：消费者覆盖 aria-label 时以消费者的为准
  it('root carousel aria-label can be overridden by consumer', () => {
    renderCarousel({ 'aria-label': '运营物料轮播' });
    const root = document.querySelector('[data-slot="carousel"]');
    expect(root).toHaveAttribute('aria-label', '运营物料轮播');
  });

  it('renders region role + carousel roledescription and BEM class', () => {
    renderCarousel();
    const root = document.querySelector('[data-slot="carousel"]') as HTMLElement;
    expect(root).toHaveAttribute('role', 'region');
    expect(root).toHaveAttribute('aria-roledescription', 'carousel');
    expect(root).toHaveClass('carousel', 'carousel--in-place');
  });

  it('renders items as slide groups inside the content track', () => {
    renderCarousel();
    const content = document.querySelector('[data-slot="carousel-content"]');
    expect(content).toBeInTheDocument();
    const slides = document.querySelectorAll('[data-slot="carousel-item"]');
    expect(slides).toHaveLength(3);
    slides.forEach((slide) => {
      expect(slide).toHaveAttribute('role', 'group');
      expect(slide).toHaveAttribute('aria-roledescription', 'slide');
    });
  });

  it('renders prev/next nav buttons with accessible labels', () => {
    renderCarousel();
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument();
  });

  it('applies layout type modifier class', () => {
    render(
      <Carousel type="modal">
        <Carousel.Content>
          <Carousel.Item>Only</Carousel.Item>
        </Carousel.Content>
      </Carousel>,
    );
    const root = document.querySelector('[data-slot="carousel"]') as HTMLElement;
    expect(root).toHaveClass('carousel--modal');
    expect(within(root).getByText('Only')).toBeInTheDocument();
  });
});
