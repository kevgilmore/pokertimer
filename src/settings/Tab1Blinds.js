import {DeleteOutlined, MenuOutlined} from '@ant-design/icons';
import { DndContext } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Space, Table, Form, InputNumber, Flex, Checkbox } from 'antd';
import React, { useState, useRef, useContext, useEffect } from 'react';
import {useDispatch, useSelector} from "react-redux";
import {addBlindLevel, updateBlindStructure, deleteBlindLevel, toggleAnte} from "../redux/game";


const EditableContext = React.createContext(null);

const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
  }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
    useEffect(() => {
      if (editing) {
        inputRef.current.focus();
      }
    }, [editing]);
    const toggleEdit = () => {
      setEditing(!editing);
      form.setFieldsValue({
        [dataIndex]: record[dataIndex],
      });
    };
    const save = async () => {
      try {
        const values = await form.validateFields();
        toggleEdit();
        handleSave({
          ...record,
          ...values,
        });
      } catch (errInfo) {
        console.log('Save failed:', errInfo);
      }
    };
    let childNode = children;
    if (editable) {
      childNode = editing ? (
        <Form.Item
          style={{
            margin: 0,
              width: 75,
          }}
          name={dataIndex}
          rules={[
            {
              required: true,
              message: `${title} is required.`,
            },
            {
              type: 'number',
            }
          ]}
        >
          <InputNumber
            ref={inputRef}
            stringMode={false}
            onPressEnter={save} onBlur={save} tabIndex={dataIndex}
            min={0}
          />
        </Form.Item>
      ) : (
        <div
          className="editable-cell-value-wrap"
          style={{
            paddingTop:1,
            paddingRight: 50,
          }}
          onClick={toggleEdit}
          onFocus={toggleEdit}
          tabIndex={0}
        >
          {children}
        </div>
      );
    }
    return <td {...restProps}>{childNode}</td>;
  };

const EditableRow = ({ children, ...props }) => {
    const [form] = Form.useForm();
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: props['data-row-key'],
    });
    const style = {
        ...props.style,
        transform: CSS.Transform.toString(
            transform && {
                ...transform,
                scaleY: 1,
            },
        )?.replace(/translate3d\(([^,]+),/, 'translate3d(0,'),
        transition,
        ...(isDragging
            ? {
                position: 'relative',
                zIndex: 9999,
            }
            : {}),
    };
    
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
            <tr {...props} ref={setNodeRef} style={style} {...attributes}>
            {React.Children.map(children, (child) => {
                if (child.key === 'sort') {
                    return React.cloneElement(child, {
                        children: (
                            <MenuOutlined
                                ref={setActivatorNodeRef}
                                style={{
                                    touchAction: 'none',
                                    cursor: 'move',
                                }}
                                {...listeners}
                            />
                        ),
                    });
                }
                return child;
            })}
            </tr>
        </EditableContext.Provider>
      </Form>
    );
};
const Tab1Component = () => {
    const dispatch = useDispatch();
    const game = useSelector(state => state.game)
    const [dataSource, setDataSource] = useState(game.blindStructure);
    const [count, setCount] = useState(game.blindStructure.length);
    const [selectedInterval, setSelectedInterval] = useState(20);

    // Sync local state with Redux state changes
    useEffect(() => {
        setDataSource(game.blindStructure);
        setCount(game.blindStructure.length);
    }, [game.blindStructure]);
    const defaultColumns = [
        {
            key: 'sort',
        },
        {
            title: 'SMALL',
            dataIndex: 'small',
            editable: true
        },
        {
            title: 'BIG',
            dataIndex: 'big',
            editable: true
        },
        {
            title: 'MINS',
            dataIndex: 'duration',
            editable: true
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => handleDelete(record.key)}><DeleteOutlined /></Button>
                </Space>
            ),
        },
    ];
    const handleAdd = () => {
        const lastRow = dataSource[dataSource.length - 1];
        let newSmall, newBig;
        
        // Standard poker blind progression patterns
        const getNextBlindLevel = (currentValue) => {
            if (currentValue < 100) {
                return currentValue * 2; // Early levels: double
            } else if (currentValue < 500) {
                return currentValue + 200; // 100-400 range: add 200
            } else if (currentValue < 1000) {
                return currentValue + 500; // 500-900 range: add 500
            } else if (currentValue < 2000) {
                return currentValue + 1000; // 1000-1900 range: add 1000
            } else if (currentValue < 5000) {
                return currentValue + 1500; // 2000-4500 range: add 1500
            } else if (currentValue < 10000) {
                return currentValue + 2000; // 5000-9000 range: add 2000
            } else if (currentValue < 20000) {
                return currentValue + 5000; // 10000-19000 range: add 5000
            } else if (currentValue < 50000) {
                return currentValue + 10000; // 20000-49000 range: add 10000
            } else {
                return currentValue * 1.5; // High levels: 1.5x multiplier
            }
        };
        
        newSmall = getNextBlindLevel(lastRow.small);
        newBig = newSmall * 2; // Big blind is always double the small blind
        
        // Round to clean poker blind increments
        const roundToCleanBlinds = (value) => {
            if (value < 100) {
                return Math.round(value / 25) * 25; // Round to nearest 25
            } else if (value < 1000) {
                return Math.round(value / 50) * 50; // Round to nearest 50
            } else if (value < 10000) {
                return Math.round(value / 100) * 100; // Round to nearest 100
            } else if (value < 100000) {
                return Math.round(value / 500) * 500; // Round to nearest 500
            } else {
                return Math.round(value / 1000) * 1000; // Round to nearest 1000
            }
        };
        
        const newData = {
            key: (count+1).toString(),
            small: roundToCleanBlinds(newSmall),
            big: roundToCleanBlinds(newBig),
            duration: lastRow.duration,
        };
        setDataSource([...dataSource, newData]);
        setCount(count + 1);
        dispatch(addBlindLevel(newData))
    };

    const handleDelete = (key) => {
        const newData = dataSource.filter((item) => item.key !== key);
        setDataSource(newData);
        
        // Find the index of the item to delete (1-based for Redux)
        const indexToDelete = dataSource.findIndex((item) => item.key === key) + 1;
        dispatch(deleteBlindLevel(indexToDelete));
    };

    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };

    const handleSave = (row) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        setDataSource(newData);
        dispatch(updateBlindStructure(newData))
        setSelectedInterval(null)
    };

    const columns = defaultColumns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
            record,
            editable: col.editable,
            dataIndex: col.dataIndex,
            title: col.title,
            handleSave,
            }),
        };
    });

    const onDragEnd = ({ active, over }) => {
        if (active.id !== over?.id) {
            let newSortedData = []
            setDataSource((previous) => {
                const activeIndex = previous.findIndex((i) => i.key === active.id);
                const overIndex = previous.findIndex((i) => i.key === over?.id);
                newSortedData = arrayMove(previous, activeIndex, overIndex)
                return newSortedData
            });
            dispatch(updateBlindStructure(newSortedData))
        }
    };
    const handleClickInterval = (interval) => {
      setSelectedInterval(interval)
      const previousBlindStructure = [...game.blindStructure]
      const newBlindStructure = previousBlindStructure.map((blind, index) => {
        return {
          ...blind,
          duration: interval
        }
      })
      dispatch(updateBlindStructure(newBlindStructure))
      setDataSource(newBlindStructure)
    }

    return (
  
      <DndContext onDragEnd={onDragEnd}>
          {/* <h3>Set blind level time</h3> */}
            <Flex justify="center" align="center">
              {[5, 10, 15, 20, 30].map(interval => {
                return <Button key={interval} className="changeAllBtn" type={selectedInterval === interval? "primary" : "default"} onClick={() =>handleClickInterval(interval)}>{interval} mins</Button>
              })}
              
            </Flex>
            
            <div style={{ margin: '20px 0', textAlign: 'center' }}>
              <Checkbox 
                checked={game.isAnteEnabled}
                onChange={() => dispatch(toggleAnte())}
                style={{ 
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Add Big Blind Ante
              </Checkbox>
            </div>
            
            <div className="tableHeaderLabels">
                <p className="tableHeaderItem">SMALL</p>
                <p className="tableHeaderItem">BIG</p>
                <p className="tableHeaderItem">MINS</p>
            </div>

            <SortableContext
                // rowKey array
                items={dataSource.map((i) => i.key)}
                strategy={verticalListSortingStrategy}
            >
                <Table
                className='blindTable'
                    components={components}
                    rowKey="key"
                    columns={columns}
                    dataSource={dataSource}
                    pagination={false}
                    showHeader={false}
                    // scroll={{ x: 400, y: 400 }}
                />
            </SortableContext>
            <Space>
                <Button className="addNewLevelBtn" type="primary" onClick={handleAdd} shape="round" size={"large"}>ADD NEW LEVEL</Button>
            </Space>
        </DndContext>
      
      


        
    )
};
export default Tab1Component;
