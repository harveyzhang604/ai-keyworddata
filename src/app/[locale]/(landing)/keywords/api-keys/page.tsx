/**
 * API Key 管理页面
 * 用于创建、查看、删除 API Keys
 */
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  KeyIcon,
  PlusIcon,
  CopyIcon,
  TrashIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  ServerIcon,
} from 'lucide-react';

interface ApiKey {
  id: number;
  server_id: number;
  server_name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKey, setNewKey] = useState<{ server_id: string; server_name: string }>({
    server_id: '',
    server_name: '',
  });
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchApiKeys();
    fetchServers();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/admin/api-keys');
      const data = await response.json();
      if (data.success) {
        setApiKeys(data.keys);
      }
    } catch (error) {
      console.error('获取 API Keys 失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/admin/servers');
      const data = await response.json();
      if (data.success) {
        setServers(data.servers);
      }
    } catch (error) {
      console.error('获取服务器列表失败:', error);
    }
  };

  const createApiKey = async () => {
    if (!newKey.server_id || !newKey.server_name) {
      alert('请填写所有字段');
      return;
    }

    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKey),
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedKey(data.api_key);
        setShowCreateForm(false);
        setNewKey({ server_id: '', server_name: '' });
        fetchApiKeys();
      } else {
        alert('创建失败: ' + data.error);
      }
    } catch (error) {
      console.error('创建 API Key 失败:', error);
      alert('创建失败');
    }
  };

  const deleteApiKey = async (serverId: number) => {
    if (!confirm('确定要删除这个 API Key 吗？删除后服务器将无法访问系统。')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/api-keys/${serverId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchApiKeys();
      } else {
        alert('删除失败: ' + data.error);
      }
    } catch (error) {
      console.error('删除 API Key 失败:', error);
      alert('删除失败');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const toggleKeyVisibility = (keyId: number) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <KeyIcon className="h-8 w-8" />
            API Key 管理
          </h1>
          <p className="text-muted-foreground">
            为每个服务器生成独立的 API Key，用于数据上传认证
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          创建新 API Key
        </Button>
      </div>

      {/* 生成的 API Key 提示 */}
      {generatedKey && (
        <Card className="border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5" />
              API Key 创建成功！
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>API Key（请立即复制保存，不会再次显示）</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(generatedKey)}
                >
                  {copiedKey ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-sm text-yellow-800">
              ⚠️ 请立即将此 API Key 保存到安全的地方。出于安全考虑，此 Key 不会再次显示。
            </div>
            <Button
              variant="outline"
              onClick={() => setGeneratedKey(null)}
            >
              我已保存
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 创建表单 */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>创建新 API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="server_id">服务器 ID</Label>
                <Input
                  id="server_id"
                  type="number"
                  placeholder="1"
                  value={newKey.server_id}
                  onChange={(e) =>
                    setNewKey({ ...newKey, server_id: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  关联的服务器 ID（从服务器列表中查看）
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="server_name">服务器名称</Label>
                <Input
                  id="server_name"
                  placeholder="US-Server-01"
                  value={newKey.server_name}
                  onChange={(e) =>
                    setNewKey({ ...newKey, server_name: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  便于识别的服务器名称
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createApiKey}>生成 API Key</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewKey({ server_id: '', server_name: '' });
                }}
              >
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Keys 列表 */}
      <Card>
        <CardHeader>
          <CardTitle>现有 API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">加载中...</p>
          ) : apiKeys.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              还没有 API Key。点击上方按钮创建第一个。
            </p>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <ServerIcon className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{key.server_name}</p>
                        <Badge variant="outline">ID: {key.server_id}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {visibleKeys.has(key.id)
                            ? `${key.key_prefix}••••••••••••••••`
                            : `${key.key_prefix}••••••••`}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleKeyVisibility(key.id)}
                        >
                          {visibleKeys.has(key.id) ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>创建: {new Date(key.created_at).toLocaleString('zh-CN')}</span>
                        {key.last_used_at && (
                          <span>最后使用: {new Date(key.last_used_at).toLocaleString('zh-CN')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteApiKey(key.server_id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">1. 创建 API Key</h3>
            <p className="text-sm text-muted-foreground">
              为每个服务器创建独立的 API Key。创建时需要提供服务器 ID 和名称。
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">2. 保存 API Key</h3>
            <p className="text-sm text-muted-foreground">
              API Key 只会在创建时显示一次。请立即复制并保存到服务器的环境变量中。
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">3. 配置服务器</h3>
            <p className="text-sm text-muted-foreground">
              在服务器端的环境变量或配置文件中设置：
            </p>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm">
              API_KEY=kwd_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">4. 使用 API Key</h3>
            <p className="text-sm text-muted-foreground">
              在所有 API 请求的请求头中包含：
            </p>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm">
              X-API-Key: kwd_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
