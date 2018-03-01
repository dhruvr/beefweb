#include "../server_thread.hpp"
#include "../router.hpp"
#include "../request_filter.hpp"
#include "../work_queue.hpp"
#include "../settings.hpp"
#include "../project_info.hpp"

#include <catch.hpp>
#include <boost/thread/future.hpp>

namespace msrv {
namespace server_tests {

TEST_CASE("server")
{
    boost::promise<void> startedPromise;
    boost::unique_future<void> started = startedPromise.get_future();

    Router router;
    RequestFilterChain filters;
    filters.addFilter(std::make_unique<ExecuteHandlerFilter>());

    auto config = std::make_unique<ServerConfig>();
    config->allowRemote = false;
    config->port = MSRV_DEFAULT_TEST_PORT;
    config->router = &router;
    config->filters = &filters;

    ServerThread server([&] { startedPromise.set_value(); });
    server.restart(std::move(config));

    for (int i = 0; i < 10 && !started.is_ready(); i++)
        std::this_thread::sleep_for(std::chrono::milliseconds(100));

    REQUIRE(started.is_ready());
    started.get();
}

}}
