import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, fireEvent, act } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Carousel, { type CarouselApi } from './index';

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

  it('has no axe a11y violations', async () => {
    // region 配可访问名（默认 aria-label="Carousel"），prev/next 图标按钮带 aria-label
    const { container } = renderCarousel();
    expect(await axe(container)).toHaveNoViolations();
  });

  // Thumbnails / Thumbnail：参考版标 Thumbnails=role="tablist"，但 Thumbnail 基座 RAC Button
  // 会剥离 role/aria-selected，无法成合法 tab 子项；tablist 缺 tab 子项会触发 axe 违规，
  // 故有意偏差保留 role="group"（见组件注释）。这里锁住偏差后的真实渲染与 data-selected 反映。
  describe('thumbnails', () => {
    const renderThumbnails = () =>
      render(
        <Carousel>
          <Carousel.Content>
            <Carousel.Item>Slide 1</Carousel.Item>
            <Carousel.Item>Slide 2</Carousel.Item>
          </Carousel.Content>
          <Carousel.Thumbnails>
            <Carousel.Thumbnail index={0} src="/a.png" />
            <Carousel.Thumbnail index={1} src="/b.png" />
          </Carousel.Thumbnails>
        </Carousel>,
      );

    it('Thumbnails renders the carousel__thumbnails container with group semantics', () => {
      renderThumbnails();
      const group = document.querySelector('[data-slot="carousel-thumbnails"]') as HTMLElement;
      expect(group).toBeInTheDocument();
      expect(group).toHaveAttribute('role', 'group');
      expect(group).toHaveClass('carousel__thumbnails');
    });

    it('Thumbnail buttons reflect the active slide via data-selected', () => {
      renderThumbnails();
      const thumbs = document.querySelectorAll('[data-slot="carousel-thumbnail"]');
      expect(thumbs).toHaveLength(2);
      expect(thumbs[0]).toHaveClass('carousel__thumbnail');
      expect(thumbs[0]).toHaveAttribute('data-selected', 'true');
      expect(thumbs[1]).not.toHaveAttribute('data-selected');
      expect(thumbs[0]).toHaveAttribute('aria-label', 'Go to slide 1');
    });

    it('thumbnails has no axe a11y violations', async () => {
      const { container } = renderThumbnails();
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('autoplay (内建计时器与 HeroUI Pro 对齐)', () => {
    // 通过 setApi 拿到真实 Embla 实例并监听 scrollNext，借假定时器断言每个 delay 推进一次。
    // jsdom 无布局，scrollNext 不会真正切片，但插桩可证明计时器在跑/暂停/重置。
    const spyApi = (api: CarouselApi) => {
      // 强制 canScrollNext=true，让自动轮播每次都走 scrollNext 分支
      vi.spyOn(api, 'canScrollNext').mockReturnValue(true);
      return vi.spyOn(api, 'scrollNext');
    };

    let capturedApi: CarouselApi | undefined;
    const renderAutoplay = (autoplay: unknown = { delay: 1000 }) => {
      capturedApi = undefined;
      return render(
        <Carousel
          autoplay={autoplay as never}
          setApi={(api) => {
            capturedApi = api;
          }}
        >
          <Carousel.Content>
            <Carousel.Item>Slide 1</Carousel.Item>
            <Carousel.Item>Slide 2</Carousel.Item>
            <Carousel.Item>Slide 3</Carousel.Item>
          </Carousel.Content>
          <Carousel.Previous />
          <Carousel.Next />
        </Carousel>,
      );
    };

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('advances by scrollNext on each delay tick', () => {
      renderAutoplay({ delay: 1000 });
      const api = capturedApi as CarouselApi;
      const scrollNext = spyApi(api);
      // 计时器是在 setApi 回调后由 effect 启动的，重启一次确保命中插过桩的 api
      act(() => {
        api.reInit();
      });
      scrollNext.mockClear();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(scrollNext).toHaveBeenCalledTimes(1);
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(scrollNext).toHaveBeenCalledTimes(3);
    });

    it('pauses while pointer is over the carousel and resumes on leave', () => {
      renderAutoplay({ delay: 1000 });
      const api = capturedApi as CarouselApi;
      const scrollNext = spyApi(api);
      act(() => {
        api.reInit();
      });
      scrollNext.mockClear();

      const root = document.querySelector('[data-slot="carousel"]') as HTMLElement;
      // 悬停期间不应推进
      fireEvent.mouseEnter(root);
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(scrollNext).not.toHaveBeenCalled();

      // 离开后恢复推进
      fireEvent.mouseLeave(root);
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(scrollNext).toHaveBeenCalledTimes(1);
    });

    it('pauses while focus is within the carousel', () => {
      renderAutoplay({ delay: 1000 });
      const api = capturedApi as CarouselApi;
      const scrollNext = spyApi(api);
      act(() => {
        api.reInit();
      });
      scrollNext.mockClear();

      const root = document.querySelector('[data-slot="carousel"]') as HTMLElement;
      fireEvent.focusIn(root);
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(scrollNext).not.toHaveBeenCalled();
    });

    it('resets the timer after manual navigation', () => {
      renderAutoplay({ delay: 1000 });
      const api = capturedApi as CarouselApi;
      const scrollNext = spyApi(api);
      act(() => {
        api.reInit();
      });
      scrollNext.mockClear();

      // 800ms 时手动点下一张：内建计时器应重置，原 1000ms 不再触发
      act(() => {
        vi.advanceTimersByTime(800);
      });
      const next = screen.getByRole('button', { name: 'Next slide' });
      act(() => {
        fireEvent.click(next);
      });
      // 手动导航本身会调用一次 scrollNext
      const afterManual = scrollNext.mock.calls.length;
      // 再走 800ms（距重置点不足一个 delay）：不应有新的自动推进
      act(() => {
        vi.advanceTimersByTime(800);
      });
      expect(scrollNext).toHaveBeenCalledTimes(afterManual);
      // 补足到重置后的 1000ms：才发生一次自动推进
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(scrollNext).toHaveBeenCalledTimes(afterManual + 1);
    });
  });
});
