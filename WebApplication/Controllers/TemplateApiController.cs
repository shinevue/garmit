using garmit.Core;
using garmit.DomainObject;
using garmit.Service.Template;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Web.Models;
using System;
using System.Collections.Generic;
using System.Web.Http;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// テンプレートのAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/template")]
    public class TemplateApiController : ApiController
    {
        /// <summary>
        /// テンプレートサービス
        /// </summary>
        public ITemplateService TemplateService { get; set; }

        public TemplateApiController()
        {
            TemplateService = ServiceManager.GetService<ITemplateService>("TemplateService");
        }

        #region ラックテンプレート

        /// <summary>
        /// ラックテンプレートを取得する
        /// </summary>
        /// <param name="parameter">テンプレート検索時のパラメータ</param>
        /// <returns>ラックテンプレート(SearchResult型)</returns>
        [Route("getRackTemplates")]
        public SearchResult PostGetRackTemplates(SearchTemplatesParameter parameter)
        {
            SearchResult result = new SearchResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = TemplateService.GetRackTemplateSearchResult(session, parameter.TemplateName, parameter.TemplateMemo);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return result;
        }

        /// <summary>
        /// ラックテンプレートの一覧を取得する
        /// </summary>
        /// <param name="parameter">テンプレート検索時のパラメータ</param>
        [Route("getRackTemplateList")]
        public TemplateInfo PostGetRackTemplateList(SearchTemplatesParameter parameter)
        {
            TemplateInfo result = new TemplateInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = TemplateService.GetRackTemplateInfo(session, parameter.TemplateName, parameter.TemplateMemo);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                result = null;
            }

            return result;
        }

        /// <summary>
        /// テンプレートIDでラックテンプレートを取得する
        /// </summary>
        /// <param name="templateId">テンプレートID</param>
        /// <returns>ラックテンプレート</returns>
        [Route("getRackTemplate")]
        public RackTemplate GetRackTemplateById(string templateId)
        {
            RackTemplate result = new RackTemplate();
            Session session = SessionAccessor.GetSession();

            try
            {
                //データと繋がったら、コメントアウトを外す
                //result = TemplateService.GetRackTemplateInfo(session, templateId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return result;
        }

        /// <summary>
        /// ラックテンプレートを保存する
        /// </summary>
        /// <param name="rackTemplate">ラックテンプレート情報</param>
        /// <returns>成功/失敗</returns>
        [Route("setRackTemplate")]
        public bool SetRackTemplate(RackTemplate rackTemplate)
        {
            bool isSuccess = false;
            Session session = SessionAccessor.GetSession();

            try
            {
                if (TemplateService != null)
                {
                    isSuccess = TemplateService.SetRackTemplate(session, rackTemplate);
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return isSuccess;
        }

        /// <summary>
        /// ラックテンプレートを削除する
        /// </summary>
        /// <param name="templateIds">削除するテンプレートID</param>
        /// <returns>成功/失敗</returns>
        [Route("deleteRackTemplates")]
        public bool PostDeleteRackTemplates(IEnumerable<string> templateIds)
        {
            bool isSuccess = false;
            Session session = SessionAccessor.GetSession();

            try
            {
                if (TemplateService != null)
                {
                    isSuccess = TemplateService.DeleteRackTemplates(session, templateIds);
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return isSuccess;
        }

        #endregion

        #region ユニットテンプレート

        /// <summary>
        /// ユニットテンプレートを取得する
        /// </summary>
        /// <param name="parameter">テンプレート検索時のパラメータ</param>
        /// <returns>ユニットテンプレート(SearchResult型)</returns>
        [Route("getUnitTemplates")]
        public SearchResult PostGetUnitTemplates(SearchTemplatesParameter parameter)
        {
            SearchResult result = new SearchResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = TemplateService.GetUnitTemplateSearchResult(session, parameter.TemplateName, parameter.TemplateMemo);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return result;
        }

        /// <summary>
        /// ユニットテンプレートの一覧を取得する
        /// </summary>
        /// <param name="parameter">テンプレート検索時のパラメータ</param>
        [Route("getUnitTemplateList")]
        public TemplateInfo PostGetUnitTemplateList(SearchTemplatesParameter parameter)
        {
            TemplateInfo result = new TemplateInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = TemplateService.GetUnitTemplateInfo(session, parameter.TemplateName, parameter.TemplateMemo);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                result = null;
            }

            return result;
        }

        /// <summary>
        /// テンプレートIDでユニットテンプレートを取得する
        /// </summary>
        /// <param name="templateId">テンプレートID</param>
        /// <returns>ユニットテンプレート</returns>
        [Route("getUnitTemplate")]
        public UnitTemplate GetUnitTemplateById(string templateId)
        {
            UnitTemplate result = new UnitTemplate();
            Session session = SessionAccessor.GetSession();

            try
            {
                //データと繋がったら、コメントアウトを外す
                //result = TemplateService.GetUnitTemplateInfo(session, templateId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return result;
        }

        /// <summary>
        /// ユニットテンプレートを保存する
        /// </summary>
        /// <param name="unitTemplate">ユニットテンプレート情報</param>
        /// <returns>成功/失敗</returns>
        [Route("setUnitTemplate")]
        public bool SetUnitTemplate(UnitTemplate unitTemplate)
        {
            bool isSuccess = false;
            Session session = SessionAccessor.GetSession();

            try
            {
                if (TemplateService != null)
                {
                    isSuccess = TemplateService.SetUnitTemplate(session, unitTemplate);
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return isSuccess;
        }

        /// <summary>
        /// ユニットテンプレートを削除する
        /// </summary>
        /// <param name="templateIds">削除するテンプレートID</param>
        /// <returns>成功/失敗</returns>
        [Route("deleteUnitTemplates")]
        public bool PostDeleteUnitTemplates(IEnumerable<string> templateIds)
        {
            bool isSuccess = false;
            Session session = SessionAccessor.GetSession();

            try
            {
                if (TemplateService != null)
                {
                    isSuccess = TemplateService.DeleteUnitTemplates(session, templateIds);
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return isSuccess;
        }

        #endregion
        
    }
}
