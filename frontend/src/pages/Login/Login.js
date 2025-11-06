import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import './Login.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // AuthContext.login expects a credentials object { username, password }
      const result = await login({ username: values.username, password: values.password });

      // AuthContext.login returns { success: true } on success, { success: false, message } on failure
      if (result && result.success) {
        message.success(t('auth.loginSuccess'));
        navigate('/dashboard');
      } else {
        message.error(result?.message || t('auth.loginFailed'));
      }
    } catch (error) {
      // In case login throws (network error, unexpected), show error
      message.error(error.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <h1>PJICO</h1>
          <h2>{t('app.fullName')}</h2>
          <p>{t('app.description')}</p>
        </div>
        
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: t('messages.validation.required'),
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t('auth.username')}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: t('messages.validation.required'),
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('auth.password')}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              {t('auth.login')}
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <p>{t('app.copyright')}</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
