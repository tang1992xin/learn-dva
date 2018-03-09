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
  /**
   * Effects 来源于 dva 封装的底层库 redux-sagas 的概念，主要指的是处理 Side Effects ，
   * 指的是副作用（源于函数式编程），在这里可以简单理解成异步操作，所以我们是不是可以理解成 Reducers 处理同步，Effects 处理异步？
   * 这么理解也没有问题，但是要认清 Reducers 的本质是修改 model 的 state，而 Effects 主要是 控制数据流程 ，
   * 所以最终往往我们在 Effects 中会调用 Reducers。
   */
  effects: {
    *add(action, { call, put }) { //*add() {} 等同于 add: function*(){}
      yield call(delay, 1000);       // call 表示调用异步函数，，
      yield put({ type: 'minus' }); //put 表示 dispatch action
                                  // 其他的还有 select, take, fork, cancel 等，详见 redux-saga 文档 http://yelouafi.github.io/redux-saga/docs/basics/DeclarativeEffects.html
    },
  },
  /**
   * 在 dva 里有个叫 subscriptions 的概念，他来自于 elm。
   * Subscription 语义是订阅，用于订阅一个数据源，然后根据条件 dispatch 需要的 action。
   * 数据源可以是当前的时间、服务器的 websocket 连接、keyboard 输入、geolocation 变化、history 路由变化等等。
   *
   * dva 中的 subscriptions 是和 model 绑定的。
   */
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
