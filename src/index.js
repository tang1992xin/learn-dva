import dva, { connect } from 'dva';
import { Router, Route } from 'dva/router';
import React from 'react';
import styles from './index.less';
import key from 'keymaster';


//目标： 通过完成这个简单的例子，需要熟悉了 dva 包含的概念：model, router, reducers, effects, subscriptions 。

const app = dva();

app.model({
  namespace: 'count', //action
  state: {
    record: 0,
    current: 0,
  },
  reducers: {  //reducer
    add(state) {
      const newCurrent = state.current + 1;
      return { ...state,
        record: newCurrent > state.record ? newCurrent : state.record,
        current: newCurrent,
      };
    },
    minus(state) {
      return { ...state, current: state.current - 1};
    },
  },
  effects: {
    *add(action, { call, put }) { //*add() {} 等同于 add: function*(){}
      yield call(delay, 1000);       // call 表示调用异步函数，，
      yield put({ type: 'minus' }); //put 表示 dispatch action
                                  // 其他的还有 select, take, fork, cancel 等，详见 redux-saga 文档 http://yelouafi.github.io/redux-saga/docs/basics/DeclarativeEffects.html
    },
  },
  subscriptions: {
    keyboardWatcher({ dispatch }) {
      key('⌘+up, ctrl+up', () => { dispatch({type:'add'}) });
    },
  },
});

const CountApp = ({count, dispatch}) => {
  return (
    <div className={styles.normal}>
      <div className={styles.record}>Highest Record: {count.record}</div>
      <div className={styles.current}>{count.current}</div>
      <div className={styles.button}>
        <button onClick={() => { dispatch({type: 'count/minus'}); }}>+</button>
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  return { count: state.count };
}
const HomePage = connect(mapStateToProps)(CountApp);

app.router(({history}) =>
  <Router history={history}>
    <Route path="/" component={HomePage} />
  </Router>
);

app.start('#root');


// ---------
// Helpers

function delay(timeout){
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}
