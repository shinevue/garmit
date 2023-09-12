using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;

namespace garmit.Web.Helpers
{
    public static class AssemblyHelpers
    {
        /// <summary>
        /// バージョンを取得する
        /// </summary>
        /// <returns>バージョン情報</returns>
        public static string GetVersion()
        {
            Version version = typeof(Controllers.LoginApiController).Assembly.GetName().Version;
            return version.Major.ToString() + "." + version.Minor + "." + version.Build; 
        }

        /// <summary>
        /// 著作権情報を取得する
        /// </summary>
        /// <returns>著作権</returns>
        public static string GetCopyright()
        {
            Assembly assembly = typeof(Controllers.LoginApiController).Assembly;
            AssemblyCopyrightAttribute[] copyrightAttributes = (AssemblyCopyrightAttribute[])assembly.GetCustomAttributes(typeof(AssemblyCopyrightAttribute), false);
            return copyrightAttributes[0].Copyright;
        }
    }
}