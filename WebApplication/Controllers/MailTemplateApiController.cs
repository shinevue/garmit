using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.Core;
using garmit.Web.Filter;
using garmit.Web.Accessor;
using garmit.Service.MailTemplate;
using garmit.Web.Models;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// メールテンプレートのAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/mailTemplate")]
    public class MailTemplateApiController : ApiController
    {
        /// <summary>
        /// サービス
        /// </summary>
        public IMailTemplateService MailTemplateService { get; set; }

        public MailTemplateApiController()
        {
            MailTemplateService = ServiceManager.GetService<IMailTemplateService>("MailTemplateService");
        }

        /// <summary>
        /// マスタデータを取得する
        /// </summary>
        /// <returns></returns>
        [Route("getLookUp")]
        public LookUp GetLookUp()
        {
            Session session = SessionAccessor.GetSession();
            MailTemplateInfo info = new MailTemplateInfo();

            try
            {
                info = MailTemplateService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.LookUp;
        }

        /// <summary>
        /// メールテンプレートを取得する
        /// </summary>
        /// <param name="parameter"></param>
        /// <returns></returns>
        [Route("getMailTemplate")]
        public MailTemplate PostGetMailTemplate(GetMailTemplateQueryParameter parameter)
        {
            Session session = SessionAccessor.GetSession();
            MailTemplateInfo info = new MailTemplateInfo();

            try
            {
                info = MailTemplateService.GetMailTemplateInfo(session, parameter.AlarmCategory, parameter.DataType, parameter.EventType);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.MailTemplate ??
                new MailTemplate {
                    SystemId = session.SystemId,
                    AlarmCategory = parameter.AlarmCategory,
                    Datatype = parameter.DataType,
                    EventType = parameter.EventType,
                    Subject = "",
                    Body = "",
                    SequentialNo = parameter.DataType?.DtType ?? 1
                };
        }

        /// <summary>
        /// メールテンプレートを保存する
        /// </summary>
        /// <param name="mailTemplate"></param>
        /// <returns></returns>
        [Route("setMailTemplate")]
        public bool PostSetMailTemplate(MailTemplate mailTemplate)
        {
            Session session = SessionAccessor.GetSession();
            bool result = false;

            try
            {
                result = MailTemplateService.SetMailTemplate(session, mailTemplate);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return result;
        }
        
    }

}
