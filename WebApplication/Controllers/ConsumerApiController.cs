using garmit.Core;
using garmit.DomainObject;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using garmit.Service.Consumer;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// コンシューマー画面のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/Consumer")]
    public class ConsumerApiController : ApiController
    {
        /// <summary>
        /// コンシューマーサービス
        /// </summary>
        public IConsumerService ConsumerService { get; set; }
        
        public ConsumerApiController()
        {
            ConsumerService = ServiceManager.GetService<IConsumerService>("ConsumerService");
        }

        /// <summary>
        /// マスターデータを取得する
        /// </summary>
        /// <returns></returns>
        [Route("")]
        public LookUp GetGetLookUp()
        {
            Session session = SessionAccessor.GetSession();
            ConsumerInfo info = new ConsumerInfo();

            try
            {
                info = ConsumerService.GetLookUp(session);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.LookUp;
        }

        /// <summary>
        /// 検索結果を取得する
        /// </summary>
        /// <param name="lookUp"></param>
        /// <returns></returns>
        [Route("getConsumerResult")]
        public SearchResult PostGetConsumerResult(LookUp lookUp)
        {
            Session session = SessionAccessor.GetSession();
            ConsumerInfo info = new ConsumerInfo();
                        
            try
            {
                info = ConsumerService.GetConsumerList(session, lookUp);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.ConsumerResult;
        }

        /// <summary>
        /// コンシューマー情報を取得する
        /// </summary>
        /// <param name="lookUp">検索条件</param>
        /// <returns></returns>
        [Route("getConsumers")]
        public IEnumerable<Consumer> PostGetConsumers(IEnumerable<int> consumerIds)
        {
            Session session = SessionAccessor.GetSession();
            ConsumerInfo info = new ConsumerInfo();

            try
            {
                info = ConsumerService.GetConsumers(session, consumerIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            
            return info.Consumers;
        }

        /// <summary>
        /// コンシューマーを登録する
        /// </summary>
        /// <param name="consumer"></param>
        /// <returns></returns>
        [Route("setConsumer")]
        public RequestResult PostSetConsumer(Consumer consumer)
        {
            Session session = SessionAccessor.GetSession();
            ConsumerInfo info = new ConsumerInfo();

            try
            {
                info = ConsumerService.SetConsumer(session, consumer);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// コンシューマー（複数）を登録する
        /// </summary>
        /// <param name="consumers"></param>
        /// <returns></returns>
        [Route("setConsumers")]
        public RequestResult PostSetConsumers(IEnumerable<Consumer> consumers)
        {
            Session session = SessionAccessor.GetSession();
            ConsumerInfo info = new ConsumerInfo();

            try
            {
                info = ConsumerService.SetConsumers(session, consumers);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// コンシューマーを削除する
        /// </summary>
        /// <param name="consumerId"></param>
        /// <returns></returns>
        [Route("deleteConsumer")]
        public RequestResult GetDeleteConsumer(int consumerId)
        {
            Session session = SessionAccessor.GetSession();
            ConsumerInfo info = new ConsumerInfo();

            try
            {
                info = ConsumerService.DeleteConsumer(session, consumerId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// コンシューマー（複数）を削除する
        /// </summary>
        /// <param name="consumerIds"></param>
        /// <returns></returns>
        [Route("deleteConsumers")]
        public RequestResult PostDeleteConsumers(IEnumerable<int> consumerIds)
        {
            Session session = SessionAccessor.GetSession();
            ConsumerInfo info = new ConsumerInfo();

            try
            {
                info = ConsumerService.DeleteConsumers(session, consumerIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 空のコンシューマーを取得する
        /// </summary>
        /// <returns></returns>
        [Route("newConsumer")]
        public Consumer GetNewConsumer()
        {
            Session session = SessionAccessor.GetSession();
            ConsumerInfo info = new ConsumerInfo();

            try
            {
                info = ConsumerService.GetConsumer(session, -1);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.Consumers.First();
        }
        
    }
}
