import React, { Component } from 'react';
import './App.css';
import PortfolioMappingTable from './PortfolioMappingTable';
import CrudTable from './CrudTable';
import { Tabs } from 'antd';
const TabPane = Tabs.TabPane;

const counterpartyMappingColumns = [{
    title: 'id',
    dataIndex: 'id',
    width: '5%',
    readonly: true,
  }, {
    title: 'Source',
    dataIndex: 'source',
    width: '25%',
    sorter: (a, b) => a.source.localeCompare(b.source),
    options: ['BBG_FXGO', 'FLEX', 'TT'],
    filter: true,
  }, {
    title: 'Source Name',
    dataIndex: 'sourceName',
    width: '25%',
    sorter: (a, b) => a.sourceName.localeCompare(b.sourceName),
    filter: true,
  }, {
    title: 'Destination Name',
    dataIndex: 'destinationName',
    width: '25%',
    sorter: (a, b) => a.destinationName.localeCompare(b.destinationName),
    filter: true,
}];

const counterpartyRequest = 'http://localhost:8090/counterparty-mapping';

const portfolioMappingColumns = [/*{
    title: 'id',
    dataIndex: 'id',
    width: '5%',
  },*/ {
    title: 'Source',
    dataIndex: 'source',
    width: '25%',
    sorter: (a, b) => a.source.localeCompare(b.source),
    options: ['BBG_FXGO', 'FLEX', 'TT'],
    filter: true,
  }, {
    title: 'Source Portfolio',
    dataIndex: 'sourcePortfolio',
    width: '25%',
    sorter: (a, b) => a.sourcePortfolio.localeCompare(b.sourcePortfolio),
    filter: true,
  }, {
    title: 'Destination Portfolio',
    dataIndex: 'destinationPortfolio',
    width: '25%',
    sorter: (a, b) => a.destinationPortfolio.localeCompare(b.destinationPortfolio),
    filter: true,
}];

const portfolioRequest = 'http://localhost:8090/portfolio-mapping';

function onTabChange(key) {
  console.log(key);
}

class App extends Component {
  constructor(props) {
		super(props);
		this.state = {mappings: []};
	}
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Interface FIX Messages Management</h1>
        </header>
        <Tabs defaultActiveKey="1" onChange={onTabChange}>
          <TabPane tab="Counterparty Mapping" key="1">
            <CrudTable columns={ counterpartyMappingColumns } request={ counterpartyRequest } />
          </TabPane>
          <TabPane tab="Portfolio Mapping" key="2">
            <CrudTable columns={ portfolioMappingColumns } request={ portfolioRequest } />
          </TabPane>
          <TabPane tab="Message" key="3">Content of Tab Pane 3</TabPane>
        </Tabs>
      </div>
    );
  }
}

export default App;
