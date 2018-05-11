import React from 'react';
import './CrudTable.css';
import { Table, Input, Button, Popconfirm, Select, Icon } from 'antd';
import axios from 'axios';
import { withAlert } from 'react-alert';
const Option = Select.Option;

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

class CrudTable extends React.Component {
  componentDidMount() {
		axios.get(this.props.request)
    .then(data => {
      const newData = data.data;
      const newFilteredData = newData.map(item => ({ ...item }));
      this.setState({
        filteredData: newFilteredData,
        data: newData,
        addedNew: false
      });
    });
	}
  constructor(props) {
    super(props);
    const columns = this.props.columns;
    const filters = [];
    for (let i = 0; i < columns.length; i++) {
      filters.push({
        column: columns[i].dataIndex,
        searchText: '',
        visible: false,
      });
    };
    this.state = {
      data: [],
      filteredData: [],
      addedNew: false,
      filters: filters,
    };
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
    const newFilteredData = [...this.state.filteredData];
    const target = newFilteredData.filter(item => key === item.id)[0];
    if (target) {
      target[column] = value;
      this.setState({
        filteredData: newFilteredData
      });
    }
  }
  edit(key) {
    const newData = [...this.state.filteredData];
    const target = newData.filter(item => key === item.id)[0];
    if (target) {
      target.editable = true;
      this.setState({ filteredData: newData });
    }
  }
  save(key) {
    const newData = [...this.state.data];
    const newDataFiltered = [...this.state.filteredData];
    const target = newDataFiltered.filter(item => key === item.id)[0];
    if (target) {
      axios.post(this.props.request, target)
      .then(response => {
        delete target.editable;
        target.id = response.data.id;
        if (key === 0) {
          newData.push({...target});
          this.setState({
            addedNew: false,
            data: newData,
            filteredData: newDataFiltered
          })
        } else {
          Object.assign(newData.filter(item => key === item.id)[0], target)
          this.setState({
            data: newData,
            filteredData: newDataFiltered
          })
        }
        this.props.alert.info("Record update saved to server.")
      })
      .catch((e) => this.props.alert.error(e.message +  ": "
        + e.response.data.message)
      );
    }
  }
  cancel(key) {
    const newFilteredData = [...this.state.filteredData];
    const newData = [...this.state.data];
    if (key === 0) {
      newFilteredData.splice(0, 1);
      this.setState({
        filteredData: newFilteredData,
        addedNew: false
      });
      return;
    }
    const target = newFilteredData.filter(item => key === item.id)[0];
    if (target) {
      Object.assign(target, newData.filter(item => key === item.id)[0]);
      delete target.editable;
      this.setState({ filteredData: newFilteredData });
    }
  }
  onDelete = (key) => {
    axios.delete(this.props.request + '/' + key)
    .then(response => {
      const filteredData = [...this.state.filteredData];
      const data = [...this.state.data];
      this.setState({
        filteredData: filteredData.filter(item => item.id !== key),
        data: data.filter(item => item.id !== key),
      });
      this.props.alert.info("Record deleted from server.")
    })
    .catch((e) => this.props.alert.error(e.message +  ": "
      + e.response.data.message)
    );
  }
  handleAdd = () => {
    const { addedNew, filteredData } = this.state;
    if (addedNew) {
      this.props.alert.error('You have already added a new record!');
      return;
    }
    const newData = {
      id: 0,
    };
    newData.editable = true;
    this.setState({
      filteredData: [newData, ...filteredData],
      addedNew: true,
    });
  }
  onInputChange = (e) => {
    const column = e.target.name;
    const filters = this.state.filters;
    const target = filters.filter(item => column === item.column)[0];
    target.searchText = e.target.value;
    this.setState({ filters: filters });
  }
  onSearch = () => {
    const data = this.state.data;
    const filters = this.state.filters;
    let filteredData = data;
    const highlightStyle = {
      color: '#f50'
    };
    for (let i = 0; i < filters.length; i++) {
      filters[i].visible = false;
      const searchText = filters[i].searchText;
      if (searchText === '') {
        continue;
      }
      const column = filters[i].column;
      const reg = new RegExp(searchText, 'gi');
      filteredData = filteredData.map((record) => {
        if (!record[column]) {
          return null;
        }
        const match = record[column].match(reg);
        if (!match) {
          return null;
        }
        const newRecord = {...record};
        newRecord[column] = (
          <span>
            {record[column].split(reg).map((text, k) => (
              k > 0 ? [<span key={k} className="highlight" style={highlightStyle}>{match[0]}</span>, text] : text
            ))}
          </span>
        );
        return newRecord;
      }).filter(record => !!record);
    }
    this.setState({
      filters: filters,
      filteredData: filteredData,
    });
  }
  getvalue = (column) => {
    return column;
  }
  render() {
    const columns = this.props.columns;
    const filters = this.state.filters;
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const dataIndex = column.dataIndex;
      const filter = filters.filter(item => dataIndex === item.column)[0];
      const searchText = filter.searchText;
      const filtered = searchText !== '';
      const dropdownVisible = filter.visible;
      if (!column.readonly) {
        column.render = column.options ?
          (text, record) => this.renderDropdownColumns(text, record, dataIndex, column.options)
          : (text, record) => this.renderColumns(text, record, dataIndex);
      }
      if (column.filter) {
        column.filterDropdown = (
          <div className="custom-filter-dropdown">
            <Input
              ref={ele => this.searchInput = ele}
              name={column.dataIndex}
              value={searchText}
              onChange={this.onInputChange}
              onPressEnter={this.onSearch}
            />
            <Button type="primary" onClick={this.onSearch}>Search</Button>
          </div>
        );
        column.filterIcon = filtered ? <Icon type="filter" /> : <Icon type="search" />
        column.filterDropdownVisible = dropdownVisible;
        column.onFilterDropdownVisibleChange = (visible) => {
          filter.visible = visible;
          this.setState({
            filters: this.state.filters,
          }, () => this.searchInput && this.searchInput.focus());
        };
      }
    };
    const newColumns = [...columns,
      {
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
           this.state.filteredData.length > 1 ?
           (
             <Popconfirm title="Sure to delete?" onConfirm={() => this.onDelete(record.id)}>
               <a href="javascript:;">Delete</a>
             </Popconfirm>
           ) : null
         );
       },
    }];
    return (
      <div>
        <Button className="editable-add-btn" onClick={this.handleAdd}>Add</Button>
        <Table bordered rowKey="id" dataSource={this.state.filteredData} columns={newColumns} />
      </div>
    );
  }
}

export default withAlert(CrudTable);
