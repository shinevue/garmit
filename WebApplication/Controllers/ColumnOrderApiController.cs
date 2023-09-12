using garmit.Core;
using garmit.DomainObject;
using garmit.Web.Accessor;
using garmit.Web.Models;
using garmit.Web.Filter;
using garmit.Service.ColumnOrder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace garmit.Web.Controllers
{
    [SessionExpireApiFilter]
    [RoutePrefix("api/columnOrder")]
    public class ColumnOrderApiController : ApiController
    {
        public IColumnOrderService ColumnOrderService { get; set; }

        public ColumnOrderApiController()
        {
            ColumnOrderService = ServiceManager.GetService<IColumnOrderService>("ColumnOrderService");
        }

        /// <summary>
        /// カラム設定情報を取得する
        /// </summary>
        /// <param name="parameter"></param>
        /// <returns></returns>
        [Route("get")]
        public ColumnOrderInfo PostGetColumnOrder(ColumnOrderQueryParameter parameter)
        {
            ColumnOrderInfo info = new ColumnOrderInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = ColumnOrderService.GetColumnSetting(session, parameter.FunctionId, parameter.GridNo);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }

        /// <summary>
        /// カラム設定情報をセットする
        /// </summary>
        /// <param name="userColumnMapping"></param>
        /// <returns></returns>
        [Route("set")]
        public RequestResult PostSetColumnSetting(ColumnMapping userColumnMapping)
        {
            ColumnOrderInfo info = new ColumnOrderInfo();
            Session session = SessionAccessor.GetSession();
            

            try
            {
                info = ColumnOrderService.SetColumnSetting(session, userColumnMapping.Function.FunctionId, userColumnMapping.GridNo, userColumnMapping);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }
        
    }
}
