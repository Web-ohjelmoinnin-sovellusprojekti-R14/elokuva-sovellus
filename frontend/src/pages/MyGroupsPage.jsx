import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import CreateGroupModal from "../components/modals/CreateGroupModal";

const API_URL = process.env.REACT_APP_API_URL;

export default function MyGroupsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [groupsRes, invitesRes] = await Promise.all([
        fetch(`${API_URL}/api/get_user_groups`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/get_invitations`, {
          credentials: "include",
        }),
      ]);

      if (!groupsRes.ok || !invitesRes.ok) throw new Error(t("f_fetch_data"));

      const groupsData = await groupsRes.json();
      const invitesData = await invitesRes.json();

      setGroups(Array.isArray(groupsData) ? groupsData : []);
      setInvitations(invitesData.invitations || []);
    } catch (err) {
      console.error(err);
      setGroups([]);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleAccept = async (group_request_id) => {
    await fetch(
      `${API_URL}/api/accept_invitation?group_request_id=${group_request_id}`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    setInvitations((invites) =>
      invites.filter((i) => i.group_request_id !== group_request_id)
    );
    fetchData();
  };

  const handleReject = async (group_request_id) => {
    await fetch(
      `${API_URL}/api/reject_invitation?group_request_id=${group_request_id}`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    setInvitations((invites) =>
      invites.filter((i) => i.group_request_id !== group_request_id)
    );
  };

  const handleDeleteGroup = async (group_id) => {
    if (!window.confirm(t("delGrQuestion"))) {
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/api/delete_group?group_id=${group_id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || t("f_del_group"));
      }
    } catch (err) {
      alert(t("er_del_group"));
    }
  };

  const handleGroupCreated = () => {
    fetchData();
  };

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <h2 className="text-white noBack">{t("log_gr")}</h2>
        <p className="text-white-50 mt-4">
          <div className="d-flex justify-content-center mt-4">
            <Link
              to="/"
              className="btn btn-warning d-flex align-items-center gap-2"
              style={{
                borderRadius: "999px",
                padding: "0.4rem 1.5rem",
                fontWeight: "600",
                width: "auto",
                textAlign: "center",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.04)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              ← {t("ret_home")}
            </Link>
          </div>
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-light"
          style={{ width: "4rem", height: "4rem" }}
        ></div>
        <p className="text-white mt-4 noBack">{t("load_gr")}</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="display-5 text-white mb-5 text-center noBack">
        {t("my_groups")}
      </h1>

      <div className="text-center mb-5">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-success btn-lg"
          style={{ transition: "transform 0.2s ease" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.06)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {t("cr_new_group")}
        </button>
      </div>

      {invitations.length > 0 && (
        <div className="mb-5">
          <h3 className="text-warning mb-4">{t("gr_inv")}</h3>
          <div className="row g-4">
            {invitations.map((inv) => (
              <div key={inv.group_request_id} className="col-md-6 col-lg-4">
                <div
                  className="p-4 rounded-4 border"
                  style={{
                    background: "rgba(30,30,30,0.9)",
                    borderColor: "#6c757d",
                    boxShadow: "0 0 15px rgba(0,0,0,0.3)",
                    maxWidth: "400px",
                  }}
                >
                  <h5 className="text-white noBack text-center">
                    {inv.group_name}
                  </h5>
                  <div className="d-flex justify-content-center gap-3 mt-3">
                    <button
                      onClick={() => handleAccept(inv.group_request_id)}
                      className="btn btn-success flex-1"
                      style={{ transition: "transform 0.2s ease" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    >
                      {t("acc")}
                    </button>
                    <button
                      onClick={() => handleReject(inv.group_request_id)}
                      className="btn btn-danger flex-1"
                      style={{ transition: "transform 0.2s ease" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    >
                      {t("rej")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 className="text-warning mb-4">{t("your_groups")}</h3>
      {groups.length === 0 ? (
        <div className="text-center text-white-50 py-5">
          <div className="fs-1 mb-2">📂</div>
          <p>{t("not_a_member_yet")}</p>
        </div>
      ) : (
        <div className="row g-4">
          {groups.map((group) => (
            <div key={group.group_id} className="col-md-6 col-lg-4">
              <div
                className="bg-dark bg-opacity-90 p-4 rounded-4 border border-secondary h-100 d-flex flex-column"
                style={{
                  background: "rgba(20,20,20,0.9)",
                  border: "1px solid #6c757d",
                  boxShadow: "0 0 20px rgba(0,0,0,0.3)",
                }}
              >
                <h5 className="text-white text-center fw-bold noBack">
                  {group.name}
                </h5>
                {group.description && (
                  <p className="text-white-50 small group-description">
                    {group.description}
                  </p>
                )}
                <div className="mt-2">
                  <span
                    className="badge"
                    style={{
                      background: group.is_owner
                        ? "linear-gradient(135deg, #ffcc00, #ff9500)"
                        : "linear-gradient(135deg, #6c757d, #4d4c4c)",
                      color: "#000",
                      fontWeight: 700,
                      boxShadow: group.is_owner
                        ? "0 0 10px rgba(255,193,7,0.6)"
                        : "none",
                    }}
                  >
                    {group.is_owner ? t("owner") : t("memb")}
                  </span>
                </div>

                <div className="mt-auto pt-3 d-grid gap-2">
                  <Link
                    to={`/group/${group.group_id}`}
                    className="btn btn-outline-light"
                    style={{ transition: "transform 0.2s ease" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.04)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    {t("go_to_gr")}
                  </Link>

                  {group.is_owner && (
                    <button
                      onClick={() => handleDeleteGroup(group.group_id)}
                      className="btn btn-danger"
                      style={{ transition: "transform 0.2s ease" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.04)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    >
                      {t("del_gr")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleGroupCreated}
      />
    </div>
  );
}
