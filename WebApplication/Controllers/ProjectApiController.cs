using garmit.Core;
using garmit.DomainObject;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Web.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Web.Http;
using garmit.Service.Project;
using System.Linq;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// 案件サービス用のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/project")]
    public class ProjectApiController : ApiController
    {
        /// <summary>
        /// 案件サービス
        /// </summary>
        public IProjectService ProjectService { get; set; }

        public ProjectApiController()
        {
            ProjectService = ServiceManager.GetService<IProjectService>("ProjectService");
        }

        /// <summary>
        /// 案件画面の初期情報取得
        /// </summary>
        /// <returns>ControlInfo.LookUp</returns>
        [Route("")]
        public LookUp GetLookUp()
        {
            LookUp lookUp = new LookUp();
            Session session = SessionAccessor.GetSession();

            try
            {
                lookUp = ProjectService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return lookUp;
        }

        /// <summary>
        /// 案件検索
        /// </summary>
        /// <param name="condition">検索条件</param>
        /// <returns>検索結果</returns>
        [Route("getProjectResult")]
        public SearchResult PostGetProjectResult(ProjectInfo condition)
        {
            SearchResult result = new SearchResult();
            Session session = SessionAccessor.GetSession();
            try
            {
                result = ProjectService.SearchProjects(session, condition);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return result;
        }

        /// <summary>
        /// 新規案件情報取得
        /// </summary>
        /// <returns>空案件情報</returns>
        [Route("newProjectForm")]
        public ProjectForm GetNewProjectForm()
        {
            ProjectForm projectFrom = new ProjectForm();
            Session session = SessionAccessor.GetSession();
            try
            {
                projectFrom = ProjectService.GetNewProjectForm(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return projectFrom;
        }

        /// <summary>
        /// 案件情報取得
        /// </summary>
        /// <param name="projectId">案件ID</param>
        /// <returns>案件情報</returns>
        [Route("getProjectForm")]
        public ProjectForm PostGetProjectForm(IdIntegerQueryParameter parameter)
        {
            ProjectForm projectFrom = new ProjectForm();
            Session session = SessionAccessor.GetSession();
            try
            {
                projectFrom = ProjectService.GetProjectForm(session, parameter.Id);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return projectFrom;
        }

        /// <summary>
        /// 案件複数取得
        /// </summary>
        /// <param name="projectIds"></param>
        /// <returns></returns>
        [Route("getProjects")]
        public IEnumerable<Project> PostGetProjects(IEnumerable<int> projectIds)
        {
            IEnumerable<Project> projects = new List<Project>();
            Session session = SessionAccessor.GetSession();
            try
            {
                projects = ProjectService.GetProjects(session, projectIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return projects;
        }

        /// <summary>
        /// 案件情報保存
        /// </summary>
        /// <param name="projectFrom">保存する案件情報</param>
        /// <returns>保存結果</returns>
        [Route("setProject")]
        public RequestResult PostSetProject(ProjectForm projectFrom)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();
            try
            {
                result = ProjectService.SetProject(session, projectFrom);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return GetErrorRequestResult(session.CultureInfo);
            }
            return result;
        }

        /// <summary>
        /// 案件複数保存
        /// </summary>
        /// <param name="projects">保存する案件リスト</param>
        /// <returns>保存結果</returns>
        [Route("setProjects")]
        public RequestResult PostSetProjects(IEnumerable<Project> projects)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();
            try
            {
                result = ProjectService.SetProjects(session, projects);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return GetErrorRequestResult(session.CultureInfo);
            }
            return result;
        }

        #region 案件スケジュール

        /// <summary>
        /// 案件スケジュール一覧を取得する
        /// </summary>
        /// <param name="param">開始日時/終了日時</param>
        /// <returns>開始日時～終了日時までのスケジュール一覧</returns>
        [Route("getSchedules")]
        public ProjectScheduleInfo PostGetProjectScheduleList(ProjectScheduleQueryParameter param)
        {
            ProjectScheduleInfo info = new ProjectScheduleInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ProjectService.GetProjectScheduleList(session, param.StartDate, param.EndDate);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }

        #endregion

        #region private

        /// <summary>
        /// エラーリクエスト結果を取得する
        /// </summary>
        /// <param name="cultureInfo">カルチャ情報</param>
        /// <returns>リクエスト結果</returns>
        private RequestResult GetErrorRequestResult(CultureInfo cultureInfo)
        {
            return new RequestResult
            {
                IsSuccess = false,
                Message = MessageUtil.GetMessage("Project_RegisterError", cultureInfo)
            };
        }

        #endregion

    }
}
