import React from 'react';
import './CrudTable.css';
import { Table, Input, Button, Popconfirm, Select } from 'antd';
import axios from 'axios';
import { withAlert } from 'react-alert';
const Option = Select.Option;

const requestUrl = 'http://localhost:8090/portfolio-mapping';

const EditableCell = ({ editable, value, onChange }) => (
  <div>
    {editable
      ? <Input style={{ margin: '-5px 0' }} value={value} onChange={e => onChange(e.target.value)} />
      : value
    }
  </div>
);

const EditableCellDropdown = ({ editable, value, onChange, options }) => {
  const optionList = [];
  const size = options.length;
  for (let i = 0; i < size; i++) {
    const option = options[i];
    optionList.push(<Option key={i} value={option}>{option}</Option>)
  }
  return (
    <div>
      {editable
        ? <Select
            size={size}
            defaultValue={value}
            value={value}
            onChange={onChange}
            style={{ width: 200 }}
          >
            {optionList}
          </Select>
        : value
      }
    </div>
)};

class PortfolioMappingTable extends React.Component {
  componentDidMount() {
		axios.get(requestUrl)
    .then(data => {
      const newData = data.data;
      this.setState({
        data: newData,
        addedNew: false
      });
      this.cacheData = newData.map(item => ({ ...item }));
    });
	};
  constructor(props) {
    super(props);
    const sourceOptions = ['BBG_FXGO', 'FLEX', 'TT'];
    this.columns = [{
      title: 'Source',
      dataIndex: 'source',
      width: '25%',
      sorter: (a, b) => a.source.localeCompare(b.source),
      render: (text, record) => this.renderDropdownColumns(text, record, 'source', sourceOptions),
    }, {
      title: 'Source Portfolio',
      dataIndex: 'sourcePortfolio',
      width: '25%',
      sorter: (a, b) => a.sourcePortfolio.localeCompare(b.sourcePortfolio),
      render: (text, record) => this.renderColumns(text, record, 'sourcePortfolio'),
    }, {
      title: 'Destination Portfolio',
      dataIndex: 'destinationPortfolio',
      width: '25%',
      sorter: (a, b) => a.destinationPortfolio.localeCompare(b.destinationPortfolio),
      render: (text, record) => this.renderColumns(text, record, 'destinationPortfolio'),
  }, {
      title: 'Action',
      dataIndex: 'operationEdit',
      render: (text, record) => {
        const { editable } = record;
        return (
          <div className="editable-row-operations">
            {
              editable ?
                <span>
                  <Popconfirm title="Sure to save changes?" onConfirm={() => this.save(record.id)}>
                    <a>Save</a>
                  </Popconfirm>
                  <Popconfirm title="Sure to cancel your changes?" onConfirm={() => this.cancel(record.id)}>
                    <a>Cancel</a>
                  </Popconfirm>
                </span>
                : <a onClick={() => this.edit(record.id)}>Edit</a>
            }
          </div>
        );
      },
    }, {
      title: '',
      dataIndex: 'operationDelete',
      render: (text, record) => {
        return (
          this.state.data.length > 1 ?
          (
            <Popconfirm title="Sure to delete?" onConfirm={() => this.onDelete(record.id)}>
              <a href="javascript:;">Delete</a>
            </Popconfirm>
          ) : null
        );
      },
    }];
    this.state = { data: [], addedNew: false };
    this.cacheData = [];
  }
  renderColumns(text, record, column) {
    return (
      <EditableCell
        editable={record.editable}
        value={text}
        onChange={value => this.handleChange(value, record.id, column)}
      />
    );
  }
  renderDropdownColumns(text, record, column, options) {
    return (
      <EditableCellDropdown
        editable={record.editable}
        value={text}
        onChange={value => this.handleChange(value, record.id, column)}
        options={options}
      />
    );
  }
  handleChange(value, key, column) {
    const newData = [...this.state.data];
    const target = newData.filter(item => key === item.id)[0];
    if (target) {
      target[column] = value;
      this.setState({ data: newData });
    }
  }
  edit(key) {
    const newData = [...this.state.data];
    const target = newData.filter(item => key === item.id)[0];
    if (target) {
      target.editable = true;
      this.setState({ data: newData });
    }
  }
  save(key) {
    const newData = [...this.state.data];
    const target = newData.filter(item => key === item.id)[0];
    if (target) {
      axios.post(requestUrl, target)
      .then(response => {
        delete target.editable;
        target.id = response.data.id;
        this.setState({ data: newData });
        this.cacheData = newData.map(item => ({ ...item }));
        if (key === 0) {
          this.setState({ addedNew: false })
        }
        this.props.alert.info("Record update saved to server.")
      })
      .catch((e) => this.props.alert.error(e.message +  ": "
        + e.response.data.message)
      );
    }
  }
  cancel(key) {
    const newData = [...this.state.data];
    if (key === 0) {
      newData.splice(0, 1);
      this.setState({
        data: newData,
        addedNew: false
      });
      return;
    }
    const target = newData.filter(item => key === item.id)[0];
    if (target) {
      Object.assign(target, this.cacheData.filter(item => key === item.id)[0]);
      delete target.editable;
      this.setState({ data: newData });
    }
  }
  onDelete = (key) => {
    axios.delete(requestUrl + '/' + key)
    .then(response => {
      const data = [...this.state.data];
      this.setState({ data: data.filter(item => item.id !== key) });
      this.props.alert.info("Record deleted from server.")
    })
    .catch((e) => this.props.alert.error(e.message +  ": "
      + e.response.data.message)
    );
  }
  handleAdd = () => {
    const { addedNew, data } = this.state;
    if (addedNew) {
      this.props.alert.error('You have already added a new record!');
      return;
    }
    const newData = {
      id: 0,
    };
    newData.editable = true;
    this.setState({
      data: [newData, ...data],
      addedNew: true,
    });
  }
  render() {
    return (
      <div>
        <Button className="editable-add-btn" onClick={this.handleAdd}>Add</Button>
        <Table bordered rowKey="id" dataSource={this.state.data} columns={this.columns} />
      </div>
    );
  }
}

export default withAlert(PortfolioMappingTable);
