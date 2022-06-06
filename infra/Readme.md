# Infra Deployment
## [app] Apc-simulator

1. 增加環境變數給mongodb連接使用

    ![](https://i.imgur.com/1S5jWcN.png)

2. 部屬apc-simulator

   ```kubectl apply -f deployment.yaml```

   ```kubectl apply -f service.yaml```

## [nats] Nats-server

1. 部屬nats-server

    ```kubectl apply -f deployment.yaml```
    
    ```kubectl apply -f service.yaml```
    

## [db] MongoDB

1. 以下為安裝檔案

    https://github.com/ming-ouo/cloud-native-final-project/tree/main/infra/db
    
    ```
    mongodb-deployment.yaml
    mongodb-svc.yaml
    mongodb-pv.yaml
    mongodb-pvc.yaml
    mongodb-secrets.yaml
    ```
    
2. 快速安裝可以直接執行
 
    ```kubectl apply -f .```

3. 創建mongoDB Secret 

    ```kubectl apply -f mongodb-secrets.yaml```

    k8s中的Secret是用於向container提供敏感訊息，數據以base64編碼格式儲存。為了MongoDB的安全性，使用密碼限制使用者對DB的使用。使用Secrets將我們想要的密碼load到容器中。使用完secret yaml檔後可刪除或加入`.gitignore`
  
      ```shell=
      ## mongodb-secrets.yaml

    apiVersion: v1
    data:
        password: 123456789 
        username: abcdefghij 
    kind: Secret
    metadata:
        creationTimestamp: null
        name: mongo-creds
      ```
   
4. 創建mongoDB Persistent Volume

    ```kubectl create -f mongodb-pv.yaml```
    
    ```kubectl create -f mongodb-pvc.yaml```
    
    我們需要volumes儲存永久資料，即使pods掛掉，資料仍然存在
    
    **PersistentVolumes (PV)**: 儲存位置、容量
    
    **Persistent Volume Claims (PVC)**: 使用PV設定儲存位置、容量並動態配置空間 

5. 部屬mongoDB

    ```kubectl create -f mongodb-deployment.yaml```

6. 創建外部連接到MongoDB的Services

    ```kubectl create -f mongodb-svc.yaml```
    
    Services在k8s是用來與其他pod建立通訊. ```ClusterIP``` 通常用來做內部pods間的通訊，所以我們設定port 27017開放給同cluster中其他pod連

## [kube-prometheus-stack] Helm 安裝及使用

- environment: windows10
- 利用 choco 來安裝 helm
- Helm 會按照 template (也就是 chart) 來產生 yaml 檔，並用 kubectl 執行，是一個管理 yaml 檔很好的功能 

1. 開啟 powershell in admin，安裝choco

    ```Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))```

2. 安裝 helm 到 kubenetes 中

    ```choco install kubernetes-helm```

3. 初始化 Helm

    ```helm init --canary-image``` 
4. 加入 Prometheus Community Helm repo，為後續安裝做準備

    ```helm repo add prometheus-community https://prometheus-community.github.io/helm-charts```

## [kube-prometheus-stack] Prometheus and Grafana

1. 使用 helm 安裝 Prometheus and Grafana，建立在 prometheus-community中 kube-prometheus-stack 的 service 和 deployment (default) 

    ```helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace --values values.yaml```

    - 上述指令為用 **prometheus-community/kube-prometheus-stack** 裡面的template，建立一個 release name **kube-prometheus-stack** 

    - 需要修改的部分 (e.g: 新增一個 prometheus job) 則寫在 **values.yaml** 中

    - 這個 template 會建立 Prometheus, Prometheus Operator, Alertmanager, Grafana, kube-state-metrics, prometheus-node-exporter 的 pod 

2. Helm 指令執行完成之後，驗證有沒有正確安裝成功

    ```kubectl get po,svc -n=monitoring```

3. 若要從 local 存取 K8S 內的 Prometheus Service ，使用 port forwarding 執行以下指令

    ```kubectl port-forward -n=monitoring svc/kube-prometheus-stack-prometheus 9090:9090```

    - 執行完成後，可從 **http://localhost:9090/** 進入 prometheus

4.  若要從 local 存取 K8S 內的 Grafana Service ，使用 port forwarding 執行以下指令

    ```kubectl port-forward -n=monitoring svc/kube-prometheus-stack-grafana 8080:80```

    - 執行完成後，可從 **http://localhost:8080/** 進入 grafana
    - Grafana 帳號: admin / 密碼: prom-operator
    
## [Grafana-Dashboard] import  json dashboard file

- 我們有三個dashbord，分別觀察 apc-simulator pod、three nodes 和 overall




