using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.DomainObject;
using garmit.Core;
using garmit.Web.Models;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Service.Tag;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// デフォルト設定画面のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/tag")]
    public class TagApiController : ApiController
    {
        public ITagService TagService { get; set; }

        public TagApiController()
        {
            TagService = ServiceManager.GetService<ITagService>("TagService");
        }
        
        /// <summary>
        /// マスタデータを取得する
        /// </summary>
        /// <returns></returns>
        [Route("getLookUp")]
        public LookUp GetLookUp()
        {
            Session session = SessionAccessor.GetSession();
            TagInfo info = new TagInfo();

            try
            {
                info = TagService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.LookUp;
        }

        /// <summary>
        /// 所属IDからマスタデータを取得する
        /// </summary>
        /// <param name="enterpriseId"></param>
        /// <returns></returns>
        [Route("getLookUpByEnterpriseId")]
        public LookUp GetLookUp(int enterpriseId)
        {
            Session session = SessionAccessor.GetSession();
            TagInfo info = new TagInfo();

            try
            {
                info = TagService.GetLookUp(session, enterpriseId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.LookUp;
        }

        /// <summary>
        /// タグを取得する
        /// </summary>
        /// <returns></returns>
        [Route("getTagInfo")]
        public TagInfo GetTagInfo()
        {
            Session session = SessionAccessor.GetSession();
            TagInfo info = new TagInfo();

            try
            {
                info = TagService.GetTagInfo(session);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }

        /// <summary>
        /// タグ詳細を取得する
        /// </summary>
        /// <param name="tagId"></param>
        /// <returns></returns>
        [Route("getTagDetail")]
        public Tag GetTagInfo(int tagId)
        {
            Session session = SessionAccessor.GetSession();
            TagInfo info = new TagInfo();

            try
            {
                info = TagService.GetTagInfo(session, tagId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.Tags.FirstOrDefault();
        }

        /// <summary>
        /// タグに紐づいているメンバーをタグの所属で使用できるものだけに絞り込む
        /// </summary>
        /// <param name="tag"></param>
        /// <returns></returns>
        [Route("narrowTagMember")]
        public Tag PostNarrowTagMember(Tag tag)
        {
            Session session = SessionAccessor.GetSession();
            Tag narrowedTag = null;

            try
            {
                narrowedTag = TagService.NarrowTagMember(session, tag);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return narrowedTag;
        }

        /// <summary>
        /// タグを登録する
        /// </summary>
        /// <param name="tag"></param>
        /// <returns></returns>
        [Route("setTag")]
        public bool PostSetTag(Tag tag)
        {
            Session session = SessionAccessor.GetSession();
            bool ret = false;

            try
            {
                ret = TagService.SetTag(session, tag);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return ret;
        }

        /// <summary>
        /// タグを削除する
        /// </summary>
        /// <param name="tag"></param>
        /// <returns></returns>
        [Route("deleteTag")]
        public bool PostDeleteTag(Tag tag)
        {
            Session session = SessionAccessor.GetSession();
            bool ret = false;

            try
            {
                ret = TagService.DeleteTag(session, tag);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return ret;
        }
    }
}
