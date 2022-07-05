# GRPC load balancing in Kubernetes

> Khi viết các ứng dụng giao tiếp với nhau theo framework grpc và deploy lên Kubernetes. Để cấu hình cho client application 
> gọi qua server application, ta thường thông qua headless service của Kubernetes và ta nghĩ rằng kubernetes service sẽ load 
> balancing cho ta. Nhưng thực tế thì không như vậy.

## Nội dung


### Vấn đề

Ta hãy thử cài đặt 1 ví dụ sau đây. [Grpc xds example](https://github.com/trinhdaiphuc/grpc-xds-example). Clone project vể và cài đặt 
Kubernetes và Prometheus operator (có link cài đặt trong repo). Chạy grpc server và grpc client để gửi request tới grpc server thông qua 
Kubernetes headless service. Ta chỉ cần chạy lệnh. Ở đây grpc client sẽ gửi request liên tục trong 5 phút với 100 concurrency request (để 
tuỳ chỉnh cấu hình xem trong phần Configuration)

```bash
kubectl apply -f ./deploy/namespace.yml 
kubectl apply -f ./deploy/server.yml 
kubectl apply -f ./deploy/client.yml 
```

Ví dụ này mình có tạo metrics cho các application để theo dõi số lương request client gửi đi và server nhận được. Chỉ cần bật Grafana service đã được cài trong Kubernetes lên và import dashboard vào để theo dõi. Và xem kết quả

![grpc client load test](./images/programing-language/golang/grpc-client.png)

Chỉ có 1 server nhận được tất cả request. Restart lại grpc client và thử lại ta sẽ thấy server khác lại nhận tất cả các request.

### Tại sao service của kubernetes không thể cân bằng tải cho grpc?

Việc này không phải so service mà là do cơ chế của grpc. Ta biết được grpc được build trên HTTP/2. HTTP/2 được thiết kế cho việc mở một 
long-lived TCP connection và tất cả requests đều được gửi trong 1 connection và gửi liên tục suốt quá trình connection được mở (multiplexe - 
không bị Head-of-line blocking như HTTP/1). Vì vậy khi kết nối được tạo tới 1 server thì các request sẽ chỉ gửi theo connection đó nên sẽ 
không load balance được.

![grpc client not load balance](./images/programing-language/golang/grpc-client-not-load-balancing.png)

