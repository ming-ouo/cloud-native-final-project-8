# Infa Deployment
## [app] Apc-simulator

1. 增加環境變數給mongodb連接使用

    ![](https://i.imgur.com/1S5jWcN.png)

2. 部屬apc-simulator

    ```kubectl apply -f deployment.yaml```

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
    
