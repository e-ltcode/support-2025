import React, { forwardRef } from 'react';

type ListProps = {
  direction?: 'vertical' | 'horizontal';
  children: React.ReactNode;
};

export function List({ direction, ...rest }: ListProps) {
  return (
    // <ListGroup as="ul" variant='dark' className={level > 1 ? 'mb-0 ms-2' : 'mb-0'}
    // <ListGroup as="ul" variant='dark' className={'block mb-0 ms-2'}>
    // </ListGroup>
    <ul
      className={`p-2 ${direction === 'horizontal' ? 'flex' : 'block'} list-group list-group-dark`}
      {...rest}
    />
  );
}

type ListItemProps = {
  children: React.ReactNode;
};

export const ListItem = forwardRef<React.ComponentRef<'li'>, ListItemProps>(
  function ListItem(props, ref) {
    return <li ref={ref} className="m-0 border bg-slate-200 p-0" {...props} />;
  },
);

export function Loading() {
  return (
    <div className="animate-pulse bg-slate-600 p-2 text-white">Loading...</div>
  );
}
