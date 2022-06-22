# Use HTTP Client to enhance performance

> Để tạo một request lấy thông tin từ một server chứng ta hay sử dụng `http.DefaultClient` hoặc `&http.Client{}` mà
> không cấu hình gì thêm. Vậy điều này có ảnh hưởng gì tới hiệu năng của ứng dụng?

## Table of content:

1. [Default HTTP Client](#default-http-client)
2. [Default Transport](#default-transport)

### Default HTTP Client

Khi ta sử dụng `http.DefaultClient`, `&http.Client{}`, `http.Get(url,...)` để tạo mộ http client thì thư viện sẽ
dùng các cầu hình mặc định của thư viện. Trong package `net/http` thì struct `Client` được mô tả như sau.

```go
type Client struct {
    // Transport specifies the mechanism by which individual
    // HTTP requests are made.
    // If nil, DefaultTransport is used.
    Transport RoundTripper

    // CheckRedirect specifies the policy for handling redirects.
    // If CheckRedirect is not nil, the client calls it before
    // following an HTTP redirect. The arguments req and via are
    // the upcoming request and the requests made already, oldest
    // first. If CheckRedirect returns an error, the Client's Get
    // method returns both the previous Response (with its Body
    // closed) and CheckRedirect's error (wrapped in a url.Error)
    // instead of issuing the Request req.
    // As a special case, if CheckRedirect returns ErrUseLastResponse,
    // then the most recent response is returned with its body
    // unclosed, along with a nil error.
    //
    // If CheckRedirect is nil, the Client uses its default policy,
    // which is to stop after 10 consecutive requests.
    CheckRedirect func(req *Request, via []*Request) error

    // Jar specifies the cookie jar.
    Jar CookieJar

    // Timeout specifies a time limit for requests made by this
    // Client. The timeout includes connection time, any
    // redirects, and reading the response body. The timer remains
    // running after Get, Head, Post, or Do return and will
    // interrupt reading of the Response.Body.
    //
    // A Timeout of zero means no timeout.
    //
    // The Client cancels requests to the underlying Transport
    // as if the Request's Context ended.
    //
    // For compatibility, the Client will also use the deprecated
    // CancelRequest method on Transport if found. New
    // RoundTripper implementations should use the Request's Context
    // for cancellation instead of implementing CancelRequest.
    Timeout time.Duration
}
```

- **Transport** là thành phần chính quản lý connection pool. Nếu không cấu hình gì thì thư viện sẽ lấy `DefaultTransport` phần này sẽ nói rõ hơn ở phần sau.

- **CheckRedirect** là hàm để quản lý các yêu cầu của khi gặp một redirect request. Hàm được gọi trước khi thực hiện
request sau. Hàm này có 2 tham số là `req` và `via`. `req` thê hiện cho request tiếp theo sẽ được gọi. `via` lưu lại
các request trước đã chuyển hướng. Ta có thể sử dụng hàm này để tránh trường hợp request bắt ta chuyển hướng quá
nhiều lần.

    ```go
    client := *http.DefaultClient
    client.CheckRedirect = func(req *http.Request, via []*http.Request) error {
        if len(via) >= 5 {
            return fmt.Errorf("too many redirects")
        }
        if len(via) == 0 {
            return nil
        }
        for attr, val := range via[0].Header {
            if _, ok := req.Header[attr]; !ok {
                req.Header[attr] = val
            }
        }
        return nil
    }
    ```

- **Jar** dùng để tạo Cookie cho request.

- **Timeout** cấu hình giới hạn thời gian cho mỗi request. Thời gian này bao gồm cả thời gian chuyển hướng và đọc
response body. Cấu hình mặc định là `no timeout`. Giả sử như request tới server bị rớt thì khi đó request này sẽ
không đóng lại và connection vẫn mở, và nếu các request cứ gọi tới server thì connection bị treo sẽ tăng lên. Vì vậy
ta nên đặt một thời gian timeout cho request khi tạo một http client phù hợp với ngữ cảnh sử dụng. Ví dụ:

    ```go
    var httpClient = &http.Client{
        Timeout: time.Second * 15,
    }
    ```

### Default Transport

Struct `Transport` dùng để quản lý các connection và idle connection và thực hiện việc gọi request tới server. Cùng xem qua mô tả về struct `Transport` và biến `DefaultTransport`.

```go
// DefaultTransport is the default implementation of Transport and is
// used by DefaultClient. It establishes network connections as needed
// and caches them for reuse by subsequent calls. It uses HTTP proxies
// as directed by the $HTTP_PROXY and $NO_PROXY (or $http_proxy and
// $no_proxy) environment variables.
var DefaultTransport RoundTripper = &Transport{
    Proxy: ProxyFromEnvironment,
    DialContext: defaultTransportDialContext(&net.Dialer{
        Timeout:   30 * time.Second,
        KeepAlive: 30 * time.Second,
    }),
    ForceAttemptHTTP2:     true,
    MaxIdleConns:          100,
    IdleConnTimeout:       90 * time.Second,
    TLSHandshakeTimeout:   10 * time.Second,
    ExpectContinueTimeout: 1 * time.Second,
}

// DefaultMaxIdleConnsPerHost is the default value of Transport's
// MaxIdleConnsPerHost.
const DefaultMaxIdleConnsPerHost = 2

type Transport struct {
    ...

    Proxy func(*Request) (*url.URL, error)

    // MaxIdleConns controls the maximum number of idle (keep-alive)
    // connections across all hosts. Zero means no limit.
    MaxIdleConns int

    // MaxIdleConnsPerHost, if non-zero, controls the maximum idle
    // (keep-alive) connections to keep per-host. If zero,
    // DefaultMaxIdleConnsPerHost is used.
    MaxIdleConnsPerHost int

    // MaxConnsPerHost optionally limits the total number of
    // connections per host, including connections in the dialing,
    // active, and idle states. On limit violation, dials will block.
    //
    // Zero means no limit.
    MaxConnsPerHost int

    // IdleConnTimeout is the maximum amount of time an idle
    // (keep-alive) connection will remain idle before closing
    // itself.
    // Zero means no limit.
    IdleConnTimeout time.Duration
    ...
}
```

- **Proxy** trường hợp request ta cần đi qua proxy ta có thể cấu hình chỗ này. Với `DefaultTransport` có khai báo
sẵn một function proxy đó là `http.ProxyFromEnvironment` đọc proxy url từ các biến môi trường là `HTTP_PROXY` và
`HTTP_PROXYS`. Vì vậy khi dùng function này ta có thể dễ dàng bật cấu hình proxy cho client bằng cách cấu hình biến
môi trường cho ứng dụng.
- **MaxIdleConns** là số lượng idle connection tối đa có thể mở được cho **tất cả host**.
- **MaxIdleConnsPerHost** số lượng idle connection tối đa có thể mở được cho **mỗi host** và giá trị mặc định
`DefaultMaxIdleConnsPerHost` là 2, đây chính là vấn đề. Giả sử có 100 connection trong connection pool thì chỉ có 2
connection là được cấp phát cho 1 host. Khi có nhiều request gọi vào nhưng thực tế chỉ có 2 request được xử lý,
những request còn lại được chuyển về trạng thái `TIME_WAIT`. Để tránh việc bị bottle neck này thì ta nên cân nhắc
tăng số lương `MaxIdleConnsPerHost` này lên.
- **IdleConnTimeout** thời gian đóng connection khi nó không còn được sử dụng. Thư viện http có cơ chế thu thập và
sử dụng lại các connection. Khi một request được thực hiện xong, connection đó được đưa lại vào connection pool và
được tái sử dụng. Nếu như các request thực hiện xong và không còn request nào thực hiện nữa và ta không cấu hình
`IdleConnTimeout` thì connection đó vẫn sẽ được giữ kết nối mãi mãi. Việc này sẽ khá tốn tài nguyên băng thông nếu
ứng dụng chúng ta chỉ thực hiện một số lượng lớn request trong một thời gian ngắn và sau đó không thực hiện request
nào nữa. Vì vậy cần cân nhắc và cấu hình cho trường này.

Ví dụ ta có thể tận dụng lại `DefaultTransport` bằng phương thức `Clone()` để copy ra một biến Transport và tùy
chỉnh các trường theo ý muốn.

```go
t := http.DefaultTransport.(*http.Transport).Clone()
t.MaxIdleConns = 100
t.MaxConnsPerHost = 100
t.MaxIdleConnsPerHost = 100
t.IdleConnTimeout = 5 * time.Minute

httpClient = &http.Client{
  Timeout:   10 * time.Second,
  Transport: t,
}
```

## References

- [How to Use the HTTP Client in Go To Enhance Performance](https://www.loginradius.com/blog/engineering/tune-the-go-http-client-for-high-performance/)
- [Golang connection pool you must understand](https://developpaper.com/golang-connection-pool-you-must-understand/)
