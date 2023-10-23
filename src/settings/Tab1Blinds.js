import {DeleteOutlined, MenuOutlined} from '@ant-design/icons';
import { DndContext } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Space, Table, Form, Input, Flex } from 'antd';
import React, { useState, useRef, useContext, useEffect } from 'react';
import {useDispatch, useSelector} from "react-redux";
import {addBlindLevel, updateBlindLevel, deleteBlindLevel} from "../redux/game";

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
          ]}
        >
          <Input ref={inputRef} onPressEnter={save} onBlur={save} tabIndex={dataIndex}/>
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
        const newData = {
            key: (count+1).toString(),
            small: dataSource[0].small*2*count,
            big: dataSource[0].big*2*count,
            duration: dataSource[0].duration,
        };
        setDataSource([...dataSource, newData]);
        setCount(count + 1);
        dispatch(addBlindLevel(newData))
    };

    const handleDelete = (key) => {
        const newData = dataSource.filter((item) => item.key !== key);
        setDataSource(newData);
        dispatch(deleteBlindLevel(key))
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
        dispatch(updateBlindLevel(newData))
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
            dispatch(updateBlindLevel(newSortedData))
        }
    };
    return (
        <DndContext onDragEnd={onDragEnd}>
          {/* <h3>Set blind level time</h3> */}
            <Flex justify="center" align="center">
              <Button className="changeAllBtn" type="default">5 mins</Button>
              <Button className="changeAllBtn" type="default">10 mins</Button>
              <Button className="changeAllBtn" type="default">15 mins</Button>
              <Button className="changeAllBtn" type="primary">20 mins</Button>
              <Button className="changeAllBtn" type="default">30 mins</Button>
            </Flex>
            
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
                    components={components}
                    rowKey="key"
                    columns={columns}
                    dataSource={dataSource}
                    pagination={false}
                    showHeader={false}
                    size={"middle"}
                />
            </SortableContext>
            <Space>
                <Button className="addNewLevelBtn" type="primary" onClick={handleAdd} shape="round" size={"large"}>ADD NEW LEVEL</Button>
            </Space>
        </DndContext>
    )
};
export default Tab1Component;
