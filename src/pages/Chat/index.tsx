import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import classNames from 'classnames';
import { useLocation } from '@umijs/max';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import Button from 'antd/es/button';
import * as conversationServices from '@/services/conversation';
import { Modal, Spin, message } from 'antd';
import Chat, { Bubble, useMessages } from '@chatui/core';
import '@chatui/core/dist/index.css';
import styles from './index.less';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

let userId = '';

const ChatComponent: React.FC = () => {
  const pageQuery = useQuery();

  const { confirm } = Modal;
  const [activeConversationId, setActiveConversationId] = useState<string>();
  const [hoveredConversationId, setHoveredConversationId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [conversationList, setConversationList] = useState<Conversation_API.Conversation[]>([]);

  const { messages, appendMsg, setTyping, resetList } = useMessages([]);
  const [messageLoading, setMessageLoading] = useState<boolean>(false);

  const getConversationList = () => {
    if (!userId) {
      return Promise.resolve([]);
    }
    return conversationServices
      .getConversationList({ page: 1, size: 100, userId })
      .then(data => {
        return data.items;
      })
      .catch(() => {
        return [];
      });
  };

  const getChatHistory = (conversationId: string) => {
    return conversationServices
      .getConversation(conversationId)
      .then((response) => {
        if (response.messages) {
          response.messages.forEach((item) => {
            appendMsg({
              type: 'text',
              content: { text: item.content },
              position: item.role === 'user' ? 'right' : 'left',
              user: {
                avatar:
                  item.role === 'user' ? '/images/default_avatar.png' : '/images/bot_avatar.png',
              },
            });
          });
        }
      })
      .catch(() => {});
  };

  const initializeState = () => {
    resetList();
    setActiveConversationId(undefined);
    // setBotId(undefined);
    setLoading(true);
    getConversationList().then((list) => {
      setLoading(false);
      setConversationList(list);
      if (pageQuery.get('botId')) {
        // chatbotForm.setFieldsValue({ chatbotId: pageQuery.get('botId') });
      } else {
        const firstItem = list[0];
        if (firstItem) {
          setActiveConversationId(firstItem.id);
          getChatHistory(firstItem.id);
        }
      }
    });
  };

  const updateConversationList = () => {
    return getConversationList().then((list) => {
      setConversationList(list);
    });
  };

  const handleClickConversation = (conversation: Conversation_API.Conversation) => {
    if (conversation.id === activeConversationId) {
      return;
    }
    setActiveConversationId(conversation.id);
    resetList();
    getChatHistory(conversation.id);
  };

  const handleAddConversation = () => {
    setActiveConversationId(undefined);
    resetList();
  };

  const handleDeleteConversation = (id: string) => {
    confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined style={{ color: 'red' }} />,
      content: `确定删除对话么？删除不可恢复`,
      okText: '确定',
      cancelText: '取消',
      onOk() {
        conversationServices
          .deleteConversation(id)
          .then(() => {
            if (id === activeConversationId) {
              initializeState();
            } else {
              updateConversationList();
            }
          })
          .catch(() => {});
      },
      onCancel() {},
    });
  };

  const sendMessage = async (text: string) => {
    if (!userId) {
      return Promise.reject(new Error('用户未登录'));
    }
    let currentConversationId = activeConversationId;
    if (!activeConversationId) {
      try {
        const newConversation = await conversationServices.createConversation({
          topic: text.slice(0, 50),
          userId
        });
        currentConversationId = newConversation.id;
        setActiveConversationId(newConversation.id);
        await updateConversationList();
      } catch (error) {
        throw new Error('创建对话失败，请重试');
      }
    }
    try {
      const response = await conversationServices.sendMessage({
        conversationId: currentConversationId as string,
        role: 'user',
        content: text,
      });
      if (Array.isArray(response.items) && response.items[1]) {
        return response.items[1];
      } else {
        return {
          content: '',
        };
      }
    } catch (err) {
      throw new Error('服务异常');
    }
  };

  const handleSendMessage = async (type: string, val: string) => {
    if (messageLoading) {
      message.loading(`请稍后`);
      return;
    }
    if (type === 'text' && val.trim()) {
      appendMsg({
        type: 'text',
        content: { text: val },
        position: 'right',
        user: {
          avatar: '/images/default_avatar.png',
        },
      });
      setTyping(true);
      setMessageLoading(true);
      try {
        const response = await sendMessage(val);
        setTyping(false);
        setMessageLoading(false);
        if (response && response.content) {
          appendMsg({
            type: 'text',
            content: { text: response.content },
            user: {
              avatar: '/images/bot_avatar.png',
            },
          });
          updateConversationList();
        }
      } catch (error: any) {
        message.error(error.message);
        setTyping(false);
        setMessageLoading(false);
      }
    }
  };

  useEffect(() => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      userId = userInfo.id;
    } catch {}

    initializeState();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.leftContainer}>
        <Spin spinning={loading} delay={200} wrapperClassName={styles.listContainer}>
          {conversationList.map((conversation) => {
            return (
              <div
                key={conversation.id}
                className={classNames(
                  styles.conversationCard,
                  conversation.id === activeConversationId ? styles.active : '',
                )}
                onClick={() => {
                  handleClickConversation(conversation);
                }}
                onMouseEnter={() => {
                  setHoveredConversationId(conversation.id);
                }}
                onMouseLeave={() => {
                  setHoveredConversationId(undefined);
                }}
              >
                <img className={styles.conversationIcon} src="/images/conversation_icon.png" />
                <div className={styles.conversationCardContent}>
                  <div className={styles.conversationTopic}>{conversation.topic || '新的对话'}</div>
                  {/* {conversation.description ? (
                    <div className={styles.conversationDescription}>{conversation.description}</div>
                  ) : null} */}
                </div>
                {hoveredConversationId === conversation.id ? (
                  <div className={styles.actions}>
                    <DeleteOutlined
                      style={{ fontSize: 16 }}
                      onClick={(e: any) => {
                        e.stopPropagation();
                        handleDeleteConversation(conversation.id);
                      }}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </Spin>
        <Button
          className={styles.addButton}
          type="primary"
          ghost
          icon={<PlusOutlined />}
          onClick={handleAddConversation}
        >
          新对话
        </Button>
      </div>
      <div className={styles.rightContainer} style={{ opacity: loading ? 0 : 1 }}>
        <div className={styles.topBar}>
          <span>{conversationList.find((item) => item.id === activeConversationId)?.topic || `新的对话`}</span>
        </div>
        <div className={styles.messageContainer}>
          <Chat
            messages={messages}
            renderMessageContent={(msg: any) => (
              <Bubble>
                <Markdown>{msg.content.text}</Markdown>
              </Bubble>
            )}
            onSend={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
