'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  type HTMLAttributes,
} from 'react';
import { cardVariants, dom, SurfaceContext } from '@heroui/react';
import clsx from 'clsx';

type CardSlots = ReturnType<typeof cardVariants>;
const CardContext = createContext<{ slots?: CardSlots }>({});

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'secondary' | 'tertiary' | 'transparent';
};

export type CardSectionProps = HTMLAttributes<HTMLDivElement>;
type SectionProps = CardSectionProps;

/**
 * 根节点包裹 OSS @heroui/react 的真实 card 引擎：
 * - 类名来自 OSS `cardVariants`（与 css 分片 .card / .card--<variant> 同源）
 * - 用 OSS `dom.div`（react-aria 系 forwardRef 原语）真正把 ref 落到真实 DOM，triggerRef 可用
 * - 透传 `SurfaceContext`，内层组件可拿到 on-surface 对比色（transparent 不入栈，对齐 OSS）
 */
const CardRoot = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className, children, ...rest }, ref) => {
    const slots = useMemo(() => cardVariants({ variant }), [variant]);
    const content = (
      <dom.div ref={ref} data-slot="card" className={slots.base({ className })} {...rest}>
        {children}
      </dom.div>
    );

    return (
      <CardContext.Provider value={{ slots }}>
        {variant === 'transparent' ? (
          content
        ) : (
          <SurfaceContext.Provider value={{ variant }}>{content}</SurfaceContext.Provider>
        )}
      </CardContext.Provider>
    );
  },
);
CardRoot.displayName = 'Card';

const Header = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => {
  const { slots } = useContext(CardContext);
  return (
    <dom.div
      ref={ref}
      data-slot="card-header"
      className={slots ? slots.header({ className }) : clsx('card__header', className)}
      {...rest}
    />
  );
});
Header.displayName = 'Card.Header';

const Title = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => {
  const { slots } = useContext(CardContext);
  return (
    <dom.h3
      ref={ref as never}
      data-slot="card-title"
      className={slots ? slots.title({ className }) : clsx('card__title', className)}
      {...rest}
    />
  );
});
Title.displayName = 'Card.Title';

const Description = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => {
  const { slots } = useContext(CardContext);
  return (
    <dom.p
      ref={ref as never}
      data-slot="card-description"
      className={slots ? slots.description({ className }) : clsx('card__description', className)}
      {...rest}
    />
  );
});
Description.displayName = 'Card.Description';

const Content = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => {
  const { slots } = useContext(CardContext);
  return (
    <dom.div
      ref={ref}
      data-slot="card-content"
      className={slots ? slots.content({ className }) : clsx('card__content', className)}
      {...rest}
    />
  );
});
Content.displayName = 'Card.Content';

const Footer = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => {
  const { slots } = useContext(CardContext);
  return (
    <dom.div
      ref={ref}
      data-slot="card-footer"
      className={slots ? slots.footer({ className }) : clsx('card__footer', className)}
      {...rest}
    />
  );
});
Footer.displayName = 'Card.Footer';

const Card = Object.assign(CardRoot, { Header, Title, Description, Content, Footer });

export default Card;
